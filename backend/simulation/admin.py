from django.contrib import admin
from .models import NetworkDevice, NetworkConnection, AutonomicAgent, BRSKIVoucher, AuditLogEvent

@admin.register(NetworkDevice)
class NetworkDeviceAdmin(admin.ModelAdmin):
    list_display = ('node_id', 'name', 'device_type', 'ip_address', 'status', 'load', 'is_custom', 'created_at')
    list_filter = ('device_type', 'status', 'is_custom')
    search_fields = ('node_id', 'name', 'ip_address')

@admin.register(NetworkConnection)
class NetworkConnectionAdmin(admin.ModelAdmin):
    list_display = ('link_id', 'source', 'target', 'link_type', 'traffic_level', 'is_active')
    list_filter = ('link_type', 'is_active')

@admin.register(AutonomicAgent)
class AutonomicAgentAdmin(admin.ModelAdmin):
    list_display = ('agent_id', 'name', 'role', 'status', 'confidence', 'risk_level', 'updated_at')
    list_filter = ('status', 'risk_level')

@admin.register(BRSKIVoucher)
class BRSKIVoucherAdmin(admin.ModelAdmin):
    list_display = ('voucher_id', 'serial_number', 'device', 'nonce', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('serial_number', 'nonce')

@admin.register(AuditLogEvent)
class AuditLogEventAdmin(admin.ModelAdmin):
    list_display = ('event_id', 'timestamp', 'level', 'source', 'phase', 'title')
    list_filter = ('level', 'source', 'phase')
    search_fields = ('event_id', 'title', 'message')
