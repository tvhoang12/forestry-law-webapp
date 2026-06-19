/**
 * Chatbot Controller
 * Handles logic for Forestry Law chatbot (interface similar to Gemini AI)
 * Fetches API credentials dynamically from db configuration
 */
const { apiKeys } = require('../config/db');

exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Access the API key loaded from credential.json dynamically
        const geminiKey = apiKeys.gemini;
        
        // Log key presence safely (do not leak the key in logs)
        if (geminiKey) {
            console.log('Gemini API key loaded successfully.');
        } else {
            console.warn('Warning: Gemini API key is missing in credential.json');
        }

        // Base/Mock AI responses tailored to Forestry Law queries
        let reply = '';
        const cleanMessage = message.toLowerCase();

        if (cleanMessage.includes('bảo vệ rừng') || cleanMessage.includes('bao ve rung')) {
            reply = '[Phản hồi từ Chatbot Lâm Nghiệp]: Theo Luật Lâm nghiệp Việt Nam, việc bảo vệ rừng đặc dụng được ưu tiên hàng đầu. Nghiêm cấm mọi hành vi chặt phá, khai thác lâm sản trái phép, lấn chiếm đất rừng đặc dụng.';
        } else if (cleanMessage.includes('khai thác') || cleanMessage.includes('khai thac')) {
            reply = '[Phản hồi từ Chatbot Lâm Nghiệp]: Quy trình khai thác lâm sản phải tuân thủ nghiêm ngặt phương án quản lý rừng bền vững và được cơ quan kiểm lâm có thẩm quyền cấp phép.';
        } else if (cleanMessage.includes('xử phạt') || cleanMessage.includes('xu phat') || cleanMessage.includes('vi phạm') || cleanMessage.includes('vi pham')) {
            reply = '[Phản hồi từ Chatbot Lâm Nghiệp]: Các hành vi vi phạm pháp luật lâm nghiệp (phá rừng, khai thác rừng, vận chuyển gỗ trái phép...) có thể bị xử phạt vi phạm hành chính lên tới vài trăm triệu đồng hoặc truy cứu trách nhiệm hình sự.';
        } else {
            reply = `[Phản hồi từ Chatbot Lâm Nghiệp]: Cám ơn câu hỏi của bạn về: "${message}". Tôi là trợ lý AI chuyên về Luật Lâm nghiệp Việt Nam. Tôi luôn sẵn sàng tư vấn các vấn đề pháp lý về lâm nghiệp, bảo vệ và phát triển rừng.`;
        }

        res.status(200).json({
            response: reply,
            apiKeyUsed: !!geminiKey // boolean flag indicating key was loaded
        });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ error: 'Internal server error in Chatbot' });
    }
};
