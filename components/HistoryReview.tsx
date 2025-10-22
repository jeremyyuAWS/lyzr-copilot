"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  Filter, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  User,
  RefreshCw
} from "lucide-react";
import { FeedbackStorage, FeedbackEntry } from "@/lib/feedbackStorage";

export default function HistoryReview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = () => {
    const data = FeedbackStorage.getAllFeedback();
    setFeedback(data);
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.input_preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === "all" || item.rating === filterRating;
    const matchesTag = filterTag === "all" || item.tags.includes(filterTag);
    
    return matchesSearch && matchesRating && matchesTag;
  });

  const positiveCount = feedback.filter(f => f.rating === "positive").length;
  const negativeCount = feedback.filter(f => f.rating === "negative").length;
  const totalCount = feedback.length;
  const positiveRate = totalCount > 0 ? (positiveCount / totalCount * 100).toFixed(1) : "0";

  const allTags = [...new Set(feedback.flatMap(f => f.tags))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleExport = () => {
    const data = FeedbackStorage.exportFeedback();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kb-validator-feedback-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-sm text-gray-600">Total Feedback</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{positiveCount}</p>
                <p className="text-sm text-gray-600">Positive</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{negativeCount}</p>
                <p className="text-sm text-gray-600">Negative</p>
              </div>
              <ThumbsDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{positiveRate}%</p>
                <p className="text-sm text-gray-600">Satisfaction</p>
              </div>
              {parseFloat(positiveRate) >= 70 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Feedback History
              </CardTitle>
              <CardDescription>
                Review and analyze feedback from validation sessions
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadFeedback}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {item.rating === "positive" ? (
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ThumbsDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        {item.rating === "positive" ? "Positive" : "Negative"} Feedback
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">
                      "{item.input_preview}"
                    </p>
                    
                    {item.comment && (
                      <p className="text-gray-900 mb-3">"{item.comment}"</p>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    {item.user.split("@")[0]}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredFeedback.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No feedback matches your current filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}