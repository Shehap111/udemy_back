import Contact from '../models/contact.js';

// دالة إرسال الرسالة
export const createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contact = await Contact.create({ name, email, message });

    res.status(201).json({
      message: 'Contact message sent successfully',
      contact,
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// ✅ دالة جلب كل الرسائل
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
