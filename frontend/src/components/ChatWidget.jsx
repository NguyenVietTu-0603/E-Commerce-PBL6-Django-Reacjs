import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../utils/AuthContext';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
  return date.toLocaleDateString('vi-VN');
};

const normalizeConversation = (raw = {}) => ({
  id: raw.id || raw.conversation_id || `${raw.shop_id || 'shop'}-${raw.buyer_id || 'buyer'}`,
  shopId: raw.shop_id || raw.shop?.id || raw.shopId,
  shopName: raw.shop_name || raw.shop?.name || raw.shopName || `Shop #${raw.shop_id || raw.shopId || '?'}`,
  shopAvatar: raw.shop_avatar || raw.shop?.avatar,
  buyerId: raw.buyer_id || raw.buyer?.id || raw.buyerId,
  buyerName: raw.buyer_name || raw.buyer?.full_name || raw.buyerName || `Khách #${raw.buyer_id || raw.buyerId || '?'}`,
  productId: raw.product_id || raw.product?.id,
  productName: raw.product_name || raw.product?.name,
  lastMessage: raw.last_message || raw.lastMessage || 'Chưa có tin nhắn',
  updatedAt: raw.updated_at || raw.last_message_at || raw.updatedAt || new Date().toISOString(),
  unreadCount: raw.unread_count || raw.unreadCount || 0,
});

const buildFallbackConversations = (user) => {
  if (!user) return [];
  const now = new Date();
  return [
    {
      id: 'demo-1',
      shopId: user.user_type === 'seller' ? user.user_id : 101,
      shopName: user.user_type === 'seller' ? 'Shop của bạn' : 'Shop thời trang',
      buyerId: user.user_type === 'seller' ? 501 : user.user_id,
      buyerName: user.user_type === 'seller' ? 'Khách mới' : 'Bạn',
      productName: 'Áo cotton form rộng',
      lastMessage: 'Xin chào! Shop còn size M không?',
      updatedAt: now.toISOString(),
      unreadCount: user.user_type === 'seller' ? 2 : 0,
    },
    {
      id: 'demo-2',
      shopId: user.user_type === 'seller' ? user.user_id : 205,
      shopName: user.user_type === 'seller' ? 'Shop của bạn' : 'Giày Sneaker Pro',
      buyerId: user.user_type === 'seller' ? 777 : user.user_id,
      buyerName: user.user_type === 'seller' ? 'Nguyễn Trà My' : 'Bạn',
      productName: 'Sneaker Runner X',
      lastMessage: 'Shop phản hồi: Sản phẩm sẽ giao trong hôm nay nha!',
      updatedAt: new Date(now.getTime() - 3600000).toISOString(),
      unreadCount: 0,
    },
  ];
};

const ChatWidget = () => {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeConversation, setActiveConversation] = useState(null);
  const hasLoadedRef = useRef(false);

  const isSeller = user?.user_type === 'seller';

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Vui lòng đăng nhập để sử dụng chat.');
      const res = await fetch(`${API_BASE}/api/chat/conversations/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Không thể tải cuộc trò chuyện.');
      const data = await res.json();
      const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      setConversations(list.map(normalizeConversation));
      hasLoadedRef.current = true;
    } catch (err) {
      console.error('Fetch conversations error:', err);
      if (!hasLoadedRef.current) {
        setConversations(buildFallbackConversations(user).map(normalizeConversation));
      }
      setError(err.message || 'Đã xảy ra lỗi khi tải danh sách cuộc trò chuyện.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (drawerOpen && !hasLoadedRef.current) {
      fetchConversations();
    }
  }, [drawerOpen, fetchConversations]);

  if (!user) return null;

  const handleConversationClick = (conversation) => {
    setActiveConversation(conversation);
  };

  const counterpartLabel = (conversation) => {
    if (!conversation) return '';
    return isSeller ? conversation.buyerName : conversation.shopName;
  };

  return (
    <>
      <button
        className="chat-floating-button"
        onClick={() => setDrawerOpen((prev) => !prev)}
        aria-label="Mở chat"
      >
        💬
      </button>

      <div className={`chat-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="chat-drawer__header">
          <div>
            <p>Hộp thư</p>
            <h4>Cuộc trò chuyện</h4>
          </div>
          <button onClick={() => setDrawerOpen(false)} aria-label="Đóng chat">×</button>
        </div>

        <div className="chat-drawer__body">
          {loading && <div className="chat-drawer__empty">Đang tải cuộc trò chuyện...</div>}
          {!loading && error && <div className="chat-drawer__error">{error}</div>}
          {!loading && !conversations.length && !error && (
            <div className="chat-drawer__empty">Chưa có cuộc trò chuyện nào.</div>
          )}

          <div className="chat-conversation-list">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`chat-conversation-item ${
                  activeConversation?.id === conversation.id ? 'active' : ''
                }`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="chat-conversation-item__avatar">
                  {conversation.shopAvatar ? (
                    <img src={conversation.shopAvatar} alt={conversation.shopName} />
                  ) : (
                    <span>{counterpartLabel(conversation)?.charAt(0)}</span>
                  )}
                </div>
                <div className="chat-conversation-item__content">
                  <div className="chat-conversation-item__row">
                    <strong>{counterpartLabel(conversation)}</strong>
                    <span>{formatRelativeTime(conversation.updatedAt)}</span>
                  </div>
                  <p>
                    {conversation.productName && <em>{conversation.productName} • </em>}
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="chat-conversation-item__badge">{conversation.unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeConversation && (
        <ChatPopup
          conversation={activeConversation}
          onClose={() => setActiveConversation(null)}
          isSeller={isSeller}
          counterpartName={counterpartLabel(activeConversation)}
        />
      )}
    </>
  );
};

const ChatPopup = ({ conversation, onClose, isSeller, counterpartName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connecting, setConnecting] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  const shopId = useMemo(() => {
    if (isSeller) return conversation.shopId || user?.user_id;
    return conversation.shopId;
  }, [conversation.shopId, isSeller, user?.user_id]);

  const buyerParam = useMemo(() => {
    if (isSeller) return conversation.buyerId;
    return user?.user_id;
  }, [conversation.buyerId, isSeller, user?.user_id]);

  useEffect(() => {
    if (!conversation || !shopId || !buyerParam || !user) return;

    const token = localStorage.getItem('access_token') || '';
    const raw = API_BASE.replace(/^https?:\/\//, '');
    const wsProtocol = API_BASE.startsWith('https') ? 'wss' : 'ws';
    const qs = new URLSearchParams({ token, buyer: buyerParam });
    if (conversation.productId) qs.set('product', conversation.productId);

    const wsUrl = `${wsProtocol}://${raw}/ws/chat/${shopId}/?${qs.toString()}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setConnecting(true);

    ws.onopen = () => setConnecting(false);
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.type === 'history') setMessages(data.messages || []);
        else if (data.type === 'message' && data.message) setMessages((prev) => [...prev, data.message]);
      } catch (error) {
        console.error('WS parse error', error);
      }
    };
    ws.onclose = (evt) => console.log('Chat popup WS closed', evt);
    ws.onerror = (error) => console.error('Chat popup WS error', error);

    return () => ws.close();
  }, [conversation, buyerParam, shopId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const content = text.trim();
    if (!content || !wsRef.current || wsRef.current.readyState !== 1) return;
    wsRef.current.send(JSON.stringify({ type: 'message', content }));
    setText('');
  };

  return (
    <div className="chat-popup">
      <div className="chat-popup__header">
        <div>
          <p>{conversation.productName || 'Trò chuyện'}</p>
          <strong>{counterpartName}</strong>
        </div>
        <button onClick={onClose} aria-label="Đóng cuộc trò chuyện">×</button>
      </div>

      <div className="chat-popup__body">
        {connecting && <div className="chat-popup__info">Đang kết nối...</div>}
        {messages.map((message) => (
          <div
            key={message.id || `${message.created_at}-${message.sender_id}`}
            className={`chat-popup__message ${message.sender_id === user?.user_id ? 'me' : ''}`}
          >
            <div className="chat-popup__bubble">
              <div>{message.content}</div>
              <span>{new Date(message.created_at).toLocaleString('vi-VN')}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-popup__footer">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Nhập nội dung..."
        />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
};

export default ChatWidget;
