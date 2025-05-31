import { useState } from "react";
import axios from "axios";
import "./ChatInterface.css";

interface Message {
  text: string;
  isUser: boolean;
}

const ChatInterface = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMsg = { text: question, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/ask", {
        text: question,
      });
      setMessages((prev) => [
        ...prev,
        { text: res.data.answer, isUser: false },
      ]);
    } catch {
      alert("Failed to get answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={msg.isUser ? "user-msg" : "bot-msg"}>
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit">{loading ? "..." : "Send"}</button>
      </form>
    </div>
  );
};

export default ChatInterface;
