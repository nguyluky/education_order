import { Star, StarBorder } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Paper,
    Rating,
    Snackbar,
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { SessionService } from '../../services/sessions/session.service';
import { Session } from '../../types/common/models';

interface SessionReviewFormProps {
  session: Session;
  onReviewSubmitted: (updatedSession: Session) => void;
}

export const SessionReviewForm: React.FC<SessionReviewFormProps> = ({ 
  session, 
  onReviewSubmitted 
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Please provide a rating');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const sessionService = new SessionService();
      const updatedSession = await sessionService.rateSession(
        session.id, 
        rating,
        comment.trim() || ''
      );
      
      setSuccess(true);
      setRating(null);
      setComment('');
      onReviewSubmitted(updatedSession);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Rate this session
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography component="legend">Rating</Typography>
          <Rating
            name="session-rating"
            value={rating}
            onChange={(_: React.SyntheticEvent, newValue: number | null) => setRating(newValue)}
            precision={1}
            size="large"
            emptyIcon={<StarBorder fontSize="inherit" />}
            icon={<Star fontSize="inherit" />}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Comments (optional)"
            value={comment}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)}
            multiline
            rows={4}
            fullWidth
            placeholder="Share your thoughts about this session..."
            variant="outlined"
          />
        </Box>
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={loading || !rating}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Review submitted successfully!
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};