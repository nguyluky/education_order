from django.db import models

class Transaction(models.Model):
    """Model representing financial transactions on the platform."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    TYPE_CHOICES = [
        ('payment', 'Payment'),
        ('payout', 'Payout'),
        ('refund', 'Refund'),
    ]
    
    session = models.ForeignKey('sessions.Session', on_delete=models.CASCADE, related_name='transactions')
    student = models.ForeignKey('users.Student', on_delete=models.CASCADE, related_name='payments')
    educator = models.ForeignKey('users.Educator', on_delete=models.CASCADE, related_name='earnings')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=255, blank=True, null=True)  # Payment gateway transaction ID
    payment_method = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.status}"
        
class PayoutAccount(models.Model):
    """Model representing educator payout account details."""
    
    educator = models.OneToOneField('users.Educator', on_delete=models.CASCADE, related_name='payout_account')
    account_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=50)
    bank_name = models.CharField(max_length=255)
    bank_code = models.CharField(max_length=50, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payout Account for {self.educator}"
