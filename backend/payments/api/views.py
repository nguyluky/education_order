from rest_framework import generics, permissions

from payments.models import Transaction, PayoutAccount
from payments.serializers.payment_serializers import (
    TransactionSerializer, PaymentCreateSerializer,
    PayoutAccountSerializer, PayoutAccountCreateSerializer
)
from sessions.api.views import IsStudent, IsEducator

class TransactionListView(generics.ListAPIView):
    """API view to list transactions based on user role."""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return Transaction.objects.filter(student__user=user)
        elif user.user_type == 'educator':
            return Transaction.objects.filter(educator__user=user)
        return Transaction.objects.none()

class TransactionDetailView(generics.RetrieveAPIView):
    """API view to retrieve transaction details."""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return Transaction.objects.filter(student__user=user)
        elif user.user_type == 'educator':
            return Transaction.objects.filter(educator__user=user)
        return Transaction.objects.none()

class PaymentCreateView(generics.CreateAPIView):
    """API view for students to make a payment for a session."""
    serializer_class = PaymentCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context
    
    def perform_create(self, serializer):
        transaction = serializer.save()
        
        # In a real-world scenario, here you would:
        # 1. Integrate with a payment gateway (Stripe, PayPal, etc.)
        # 2. Process the payment
        # 3. Update the transaction status based on the payment result
        
        # For now, let's simulate a successful payment
        transaction.status = 'completed'
        transaction.save()
        
        # Update session status if payment is successful
        session = transaction.session
        if session.status == 'pending':
            session.status = 'confirmed'
            session.save()

class PayoutAccountView(generics.RetrieveUpdateAPIView):
    """API view for educators to manage their payout account."""
    serializer_class = PayoutAccountSerializer
    permission_classes = [permissions.IsAuthenticated, IsEducator]
    
    def get_object(self):
        try:
            return PayoutAccount.objects.get(educator__user=self.request.user)
        except PayoutAccount.DoesNotExist:
            # Return a new empty instance if no payout account exists
            return PayoutAccount(educator=self.request.user.educator_profile)

class PayoutAccountCreateView(generics.CreateAPIView):
    """API view for educators to create their payout account."""
    serializer_class = PayoutAccountCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsEducator]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context