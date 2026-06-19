/**
 * News Controller
 * Handles CRUD operations for news articles
 */

exports.getAllNews = async (req, res) => {
    // TODO: Fetch news from DB
    res.status(200).json({ message: 'Get all news (mock)', data: [] });
};

exports.getNewsById = async (req, res) => {
    // TODO: Fetch news by ID from DB
    res.status(200).json({ message: `Get news ${req.params.id} (mock)`, data: {} });
};

exports.createNews = async (req, res) => {
    // TODO: Insert new news into DB, handle media metadata
    res.status(201).json({ message: 'News created (mock)', data: req.body });
};

exports.updateNews = async (req, res) => {
    // TODO: Update news in DB
    res.status(200).json({ message: `News ${req.params.id} updated (mock)`, data: req.body });
};

exports.deleteNews = async (req, res) => {
    // TODO: Delete news from DB
    res.status(200).json({ message: `News ${req.params.id} deleted (mock)` });
};
