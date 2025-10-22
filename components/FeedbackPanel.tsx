"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Tag,
  Send,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import simulatedData from "@/data/simulated-responses.json";

interface FeedbackPanelProps {
  response: any;
  onFeedbackSubmit: (feedback: any) => void;
}

export default function FeedbackPanel({ response, onFeedbackSubmit }: FeedbackPanelProps) {
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (!rating) return;

    const feedback = {
      rating,
      comment,
      tags: selectedTags,
      timestamp: new Date().toISOString(),
      response_id: response.id || `fb-${Date.now()}`
    };

    onFeedbackSubmit(feedback);
    setIsSubmitted(true);

    // Reset form after delay
    setTimeout(() => {
      setIsSubmitted(false);
      setRating(null);
      setComment("");
      setSelectedTags([]);
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
            <div className="text-center">
              <p className="font-medium text-gray-900">Feedback Submitted!</p>
              <p className="text-sm text-gray-500">Thank you for helping improve our AI agent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          Provide Feedback
        </CardTitle>
        <CardDescription>
          Help us improve the AI agent's accuracy and responses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium">How was this response?</p>
          <div className="flex gap-2">
            <Button
              variant={rating === "positive" ? "default" : "outline"}
              onClick={() => setRating("positive")}
              className={cn(
                "flex-1",
                rating === "positive" && "bg-green-600 hover:bg-green-700"
              )}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Helpful
            </Button>
            <Button
              variant={rating === "negative" ? "default" : "outline"}
              onClick={() => setRating("negative")}
              className={cn(
                "flex-1",
                rating === "negative" && "bg-red-600 hover:bg-red-700"
              )}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Needs Work
            </Button>
          </div>
        </div>

        {/* Tags Selection */}
        {rating && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <p className="text-sm font-medium">What specifically? (Select all that apply)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {simulatedData.feedback_tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedTags.includes(tag) 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "hover:bg-blue-50"
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Comment Box */}
        {rating && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Additional comments (optional)</p>
            <Textarea
              placeholder="Tell us more about your experience with this response..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Submit Button */}
        {rating && (
          <Button 
            onClick={handleSubmit}
            className="w-full"
            disabled={!rating}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Feedback
          </Button>
        )}
      </CardContent>
    </Card>
  );
}