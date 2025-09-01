import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  productName: string;
  userType: 'customer' | 'merchant';
}

const ChatModal = ({ isOpen, onClose, customerName, productName, userType }: ChatModalProps) => {
  const [message, setMessage] = useState('');
  
  // Mock chat messages
  const mockMessages = [
    {
      id: '1',
      sender: 'customer',
      message: 'Hi, I\'m interested in your cashew nuts. Can you provide more details about the quality?',
      time: '10:30 AM',
    },
    {
      id: '2',
      sender: 'merchant',
      message: 'Hello! Thank you for your interest. Our cashews are premium grade with excellent quality. Would you like to know about pricing?',
      time: '10:32 AM',
    },
    {
      id: '3',
      sender: 'customer',
      message: 'Yes, please share the pricing for bulk orders.',
      time: '10:35 AM',
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // In real app, this would send the message to backend
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{customerName}</div>
              <div className="text-sm text-muted-foreground">{productName}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === userType ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] ${msg.sender === userType ? 'bg-purple-500 text-white' : 'bg-muted'}`}>
                <CardContent className="p-3">
                  <p className="text-sm">{msg.message}</p>
                  <div className={`text-xs mt-1 ${msg.sender === userType ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {msg.time}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button size="icon" className="bg-purple-500 text-white" onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;