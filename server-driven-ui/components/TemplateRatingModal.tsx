"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, Send, Loader2 } from "lucide-react";
import { rateTemplate, getTemplateRatings, TemplateRating } from "@/lib/api/templates.api";
import { toast } from "sonner";

interface TemplateRatingModalProps {
  templateId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateRatingModal = ({
  templateId,
  isOpen,
  onClose,
}: TemplateRatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<TemplateRating[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReviews();
    }
  }, [isOpen, templateId]);

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await getTemplateRatings(templateId);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setLoading(true);
      await rateTemplate(templateId, rating, review);
      toast.success("Rating submitted successfully!");
      setRating(0);
      setReview("");
      await loadReviews();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Rate This Template</h2>

          {/* Rating Stars */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hover || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value.slice(0, 500))}
              placeholder="Share your thoughts about this template..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{review.length}/500</p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Rating
              </>
            )}
          </button>

          {/* Recent Reviews */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
            {loadingReviews ? (
              <div className="text-center py-4">
                <Loader2 size={20} className="animate-spin mx-auto text-gray-400" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet</p>
            ) : (
              <div className="space-y-4 max-h-48 overflow-y-auto">
                {reviews.slice(0, 5).map((review) => (
                  <div
                    key={review._id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.review && (
                      <p className="text-sm text-gray-700 mb-2">{review.review}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <ThumbsUp size={12} />
                      {review.helpful} helpful
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
