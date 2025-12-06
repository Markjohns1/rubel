import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";

interface ReviewSectionProps {
  productId: number;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.reviews.getProductReviews(productId),
  });

  const { data: ratingData } = useQuery({
    queryKey: ['rating', productId],
    queryFn: () => api.reviews.getProductRating(productId),
  });

  const createMutation = useMutation({
    mutationFn: api.reviews.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['rating', productId] });
      setRating(0);
      setComment("");
      toast({ title: "Review submitted successfully!" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to submit review", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      product_id: productId,
      rating,
      comment: comment.trim() || undefined
    });
  };

  const StarRating = ({ value, interactive = false }: { value: number; interactive?: boolean }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              interactive ? 'cursor-pointer' : ''
            } ${
              star <= (interactive ? (hoverRating || value) : value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="border-b pb-6">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        {ratingData && (
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{ratingData.average_rating.toFixed(1)}</div>
            <div>
              <StarRating value={Math.round(ratingData.average_rating)} />
              <p className="text-sm text-muted-foreground mt-1">
                Based on {ratingData.review_count} review{ratingData.review_count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Write Review Form */}
      {user ? (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-4">Write a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Rating *</label>
                <StarRating value={rating} interactive />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Review (Optional)</label>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/500 characters
                </p>
              </div>
              <Button type="submit" disabled={createMutation.isPending || rating === 0}>
                {createMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Please login to write a review</p>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold">{review.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <StarRating value={review.rating} />
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}