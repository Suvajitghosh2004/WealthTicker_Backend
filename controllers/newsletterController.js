import Subscriber from '../models/Subscriber.js'
import { sendBroadcastEmail } from '../utils/sendEmail.js'

export const subscribe = async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email required' })

  const existing = await Subscriber.findOne({ email })
  if (existing) {
    if (existing.isActive) return res.status(400).json({ message: 'Already subscribed' })
    existing.isActive = true
    await existing.save()
    return res.json({ success: true, message: 'Resubscribed successfully' })
  }

  await Subscriber.create({ email })
  res.status(201).json({ success: true, message: 'Subscribed successfully!' })
}

export const getSubscribers = async (req, res) => {
  const subscribers = await Subscriber.find({ isActive: true }).sort({ createdAt: -1 })
  res.json({ success: true, subscribers, total: subscribers.length })
}

export const unsubscribe = async (req, res) => {
  const subscriber = await Subscriber.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })
  if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' })
  res.json({ success: true, message: 'Unsubscribed' })
}

export const sendBroadcast = async (req, res) => {
  const { subject, html } = req.body
  if (!subject || !html) return res.status(400).json({ message: 'Subject and HTML content required' })

  const subscribers = await Subscriber.find({ isActive: true }).select('email')
  if (subscribers.length === 0) return res.status(400).json({ message: 'No active subscribers' })

  await sendBroadcastEmail(subscribers, { subject, html })
  res.json({ success: true, message: `Broadcast sent to ${subscribers.length} subscribers` })
}
