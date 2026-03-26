const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
app.use(bodyParser.json());

// Thong tin cua trang Facebook va webhook
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || 'YOUR_PAGE_ACCESS_TOKEN';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'YOUR_VERIFY_TOKEN';

// Xac minh webhook
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        console.log('Webhook verified');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Xu ly tin nhan den
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach((entry) => {
            const webhookEvent = entry.messaging[0];
            const senderPsid = webhookEvent.sender.id;

            if (webhookEvent.message) {
                handleMessage(senderPsid, webhookEvent.message);
            } else if (webhookEvent.postback) {
                handlePostback(senderPsid, webhookEvent.postback);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Xu ly tin nhan
function handleMessage(senderPsid, receivedMessage) {
    let response;

    if (receivedMessage.text) {
        const messageText = receivedMessage.text.toLowerCase();
        
        // Tu van dua tren tu khoa
        if (messageText.includes('chào') || messageText.includes('hello')) {
            response = {
                text: `Chào bạn! 🙏 Chúc mừng bạn đến với Gốm Sứ Nam Việt.\n\nChúng tôi chuyên sản xuất:\n🏺 Hũ gạo cao cấp\n🌸 Lục bình trang trí\n☕ Mai bình uống trà\n🎁 Gốm quà tặng độc đáo\n\nBạn muốn tìm hiểu sản phẩm nào? Hãy nhắn "sản phẩm" hoặc "tư vấn" nhé!`
            };
        } else if (messageText.includes('sản phẩm') || messageText.includes('san pham')) {
            response = {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [
                            {
                                title: "Hũ Gạo Cao Cấp",
                                subtitle: "Bảo quản gạo tươi ngon, thiết kế truyền thống",
                                image_url: "https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Hu+Gao",
                                buttons: [{
                                    type: "postback",
                                    title: "Xem chi tiết",
                                    payload: "HU_GAO"
                                }]
                            },
                            {
                                title: "Lục Bình Trang Trí",
                                subtitle: "Nghệ thuật gốm sứ, làm đẹp không gian",
                                image_url: "https://via.placeholder.com/300x200/228B22/FFFFFF?text=Luc+Binh",
                                buttons: [{
                                    type: "postback",
                                    title: "Xem chi tiết",
                                    payload: "LUC_BINH"
                                }]
                            },
                            {
                                title: "Mai Bình Trà",
                                subtitle: "Thưởng thức trà đạo chuẩn Việt Nam",
                                image_url: "https://via.placeholder.com/300x200/4682B4/FFFFFF?text=Mai+Binh",
                                buttons: [{
                                    type: "postback",
                                    title: "Xem chi tiết",
                                    payload: "MAI_BINH"
                                }]
                            }
                        ]
                    }
                }
            };
        } else if (messageText.includes('giá') || messageText.includes('gia')) {
            response = {
                text: `💰 Bảng giá sản phẩm Gốm Sứ Nam Việt:\n\n🏺 Hũ gạo: 150.000đ - 500.000đ\n🌸 Lục bình: 80.000đ - 300.000đ\n☕ Mai bình: 200.000đ - 800.000đ\n🎁 Gốm quà tặng: 100.000đ - 1.000.000đ\n\nGiá có thể thay đổi theo kích thước và thiết kế. Liên hệ để được tư vấn chi tiết!`
            };
        } else if (messageText.includes('liên hệ') || messageText.includes('lien he')) {
            response = {
                text: `📞 Thông tin liên hệ Gốm Sứ Nam Việt:\n\n🌐 Website: gomsunamviet.vn\n📱 TikTok Shop: @gomsunamviet\n🛒 Shopee: Gốm Sứ Nam Việt\n📞 Hotline: 0987.654.321\n📧 Email: info@gomsunamviet.vn\n🏭 Xưởng sản xuất: 23 nghệ nhân tài hoa`
            };
        } else if (messageText.includes('tư vấn') || messageText.includes('tu van')) {
            response = {
                text: `🎯 Hãy cho chúng tôi biết:\n\n1️⃣ Bạn cần sản phẩm gì? (hũ gạo, lục bình, mai bình, quà tặng)\n2️⃣ Ngân sách dự kiến?\n3️⃣ Số lượng cần mua?\n4️⃣ Có yêu cầu đặc biệt về thiết kế?\n\nChúng tôi sẽ tư vấn sản phẩm phù hợp nhất cho bạn! 😊`
            };
        } else {
            response = {
                text: `Xin lỗi, tôi chưa hiểu câu hỏi của bạn. 😅\n\nBạn có thể hỏi về:\n• Sản phẩm gốm sứ\n• Giá cả\n• Liên hệ mua hàng\n• Tư vấn chọn sản phẩm\n\nHoặc gõ "menu" để xem các lựa chọn!`
            };
        }
    }

    callSendAPI(senderPsid, response);
}

// Xu ly postback
function handlePostback(senderPsid, receivedPostback) {
    let response;
    const payload = receivedPostback.payload;

    if (payload === 'HU_GAO') {
        response = {
            text: `🏺 HŨ GẠO CAO CẤP\n\n✨ Đặc điểm:\n• Chất liệu gốm sứ cao cấp\n• Khả năng chống ẩm tuyệt vời\n• Thiết kế truyền thống Việt Nam\n• Nhiều kích thước: 1kg, 2kg, 5kg\n\n💰 Giá: 150.000đ - 500.000đ\n🚚 Miễn phí ship nội thành\n\nMuốn đặt hàng? Nhắn "đặt hũ gạo" nhé!`
        };
    } else if (payload === 'LUC_BINH') {
        response = {
            text: `🌸 LỤC BÌNH TRANG TRÍ\n\n✨ Đặc điểm:\n• Nghệ thuật gốm sứ tinh xảo\n• Họa tiết sen, trúc, mai\n• Làm đẹp phòng khách, văn phòng\n• Kích thước đa dạng\n\n💰 Giá: 80.000đ - 300.000đ\n🎨 Có thể tùy chỉnh họa tiết\n\nThích mẫu nào? Nhắn "đặt lục bình" để tư vấn!`
        };
    } else if (payload === 'MAI_BINH') {
        response = {
            text: `☕ MAI BÌNH TRÀ ĐẠO\n\n✨ Đặc điểm:\n• Giữ nhiệt lâu, giữ hương trà\n• Thiết kế ergonomic dễ cầm\n• Phù hợp trà xanh, trà đen\n• Dung tích: 200ml - 800ml\n\n💰 Giá: 200.000đ - 800.000đ\n🍵 Tặng kèm ly sứ cao cấp\n\nSẵn sàng thưởng trà? Nhắn "đặt mai bình"!`
        };
    }

    callSendAPI(senderPsid, response);
}

// Gui tin nhan qua Facebook API
function callSendAPI(senderPsid, response) {
    const requestBody = {
        recipient: { id: senderPsid },
        message: response
    };

    request({
        uri: 'https://graph.facebook.com/v12.0/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: requestBody
    }, (err, res, body) => {
        if (!err) {
            console.log('Message sent!');
        } else {
            console.error('Unable to send message:' + err);
        }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Chatbot Gom Su Nam Viet dang chay tren port ${PORT}`);
});