import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, MessageSquare, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, Package } from "lucide-react";
import ChatModal from "@/components/ChatModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRequirements } from "@/hooks/useRequirements";
import { useResponses } from "@/hooks/useResponses";
import { useUser } from "@clerk/clerk-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const mockEnquiries = [];

const MerchantEnquiries = () => {
  const { getRequirementsAsEnquiries, updateRequirementStatus, requirements } = useRequirements();
  const { addResponse, getResponsesByRequirementId, updateResponseStatus } = useResponses();
  const { user } = useUser();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Refresh enquiries when requirements change
  useEffect(() => {
    console.log('Requirements changed, refreshing enquiries...');
    refreshEnquiries();
  }, [requirements]); // Add requirements to dependency array

  // Actual filters applied to the table
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' means no filter / "All"

  // Temporary filters (controlled inputs)
  const [tempSearchFilter, setTempSearchFilter] = useState('');
  const [tempStatusFilter, setTempStatusFilter] = useState(''); // keep '' so placeholder shows

  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseListModalOpen, setResponseListModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Response form state
  const [merchantPrice, setMerchantPrice] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'skip' | 'selected' | 'quotes'>('quotes');
  const [quantityError, setQuantityError] = useState('');
  const [error, setError] = useState("");

  // Map UI status values to the underlying enquiry statuses in your data
  const statusMap: Record<string, string[]> = {
    all: [], // no filter
    '': [], // treat empty like "all"
    new: ['active'],
    viewed: ['responded'],
    contacted: ['responded'],
    negotiating: ['pending'],
  };

  // Check if an enquiry is expired (shows only current and future dates)
  const isExpired = (enquiry: any) => {
    if (!enquiry.deliveryDeadline) return true; // If no date, consider it expired

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate date comparison

    const expiryDate = new Date(enquiry.deliveryDeadline);
    expiryDate.setHours(0, 0, 0, 0); // Set to start of day for accurate date comparison

    return expiryDate < today;
  };

  // Check if an enquiry is expiring soon (within 3 days)
  const isExpiringSoon = (enquiry: any) => {
    const today = new Date();
    const expiryDate = new Date(enquiry.deliveryDeadline);
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    return expiryDate <= threeDaysFromNow && expiryDate >= today;
  };

  // Sort enquiries
  const sortEnquiries = (enquiries: any[]) => {
    if (!sortField) return enquiries;

    return [...enquiries].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (sortField === 'deliveryDeadline') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'quantity') {
        // Extract numeric value from quantity string (e.g., "100kg" -> 100)
        aValue = parseInt(aValue.replace(/[^0-9]/g, '')) || 0;
        bValue = parseInt(bValue.replace(/[^0-9]/g, '')) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // State for enquiries
  const [enquiries, setEnquiries] = useState(() => {
    console.log('Initializing enquiries state...');
    const storedEnquiries = getRequirementsAsEnquiries()
      .filter(enquiry => {
        // Filter out any invalid or draft requirements
        const isValid = enquiry && !enquiry.isDraft && enquiry.status !== 'draft';
        if (!isValid) {
          console.log('Filtering out invalid/draft enquiry:', enquiry);
        }
        return isValid;
      })
      .map(enquiry => {
        const responses = getResponsesByRequirementId(enquiry.id);
        const hasAcceptedResponse = responses.some(r => r.status === 'accepted');
        const hasRejectedResponse = responses.some(r => r.status === 'rejected');
        const hasResponse = responses.length > 0;

        let status = enquiry.status || 'active';

        // Only override status if it's not already set to 'responded'
        if (status !== 'responded') {
          if (hasAcceptedResponse) {
            status = 'confirmed';
          } else if (hasRejectedResponse && !hasAcceptedResponse) {
            status = 'Rejected';
          } else if (hasResponse) {
            status = 'responded';
          } else {
            status = status || 'active';
          }
        }

        return {
          ...enquiry,
          status,
          buyerReply: responses.length > 0 ? responses[responses.length - 1].message : undefined
        };
      });

    console.log('Initial enquiries:', [...mockEnquiries, ...storedEnquiries]);
    return [...mockEnquiries, ...storedEnquiries];
  });

  // Filter out expired enquiries
  const activeEnquiries = useMemo(() => {
    return enquiries.filter(enquiry => !isExpired(enquiry));
  }, [enquiries]);

  // Function to refresh enquiries
  const refreshEnquiries = () => {
    console.group('=== REFRESH ENQUIRIES START ===');
    console.log('Fetching all requirements as enquiries...');
    const allEnquiries = getRequirementsAsEnquiries();
    console.log('Raw enquiries from store:', allEnquiries);

    const updatedStoredEnquiries = allEnquiries
      .filter(enquiry => {
        const isClosed = enquiry.status === 'closed';
        console.log(`Enquiry ${enquiry.id} status: ${enquiry.status}, isClosed: ${isClosed}`);
        return !isClosed; // Filter out closed enquiries
      })
      .map(enquiry => {
        console.group(`Processing enquiry ${enquiry.id}`);
        console.log('Current enquiry data:', {
          id: enquiry.id,
          currentStatus: enquiry.status,
          hasCreatedAt: !!enquiry.createdAt,
          hasLastModified: !!enquiry.lastModified
        });

        const responses = getResponsesByRequirementId(enquiry.id);
        console.log('Associated responses:', responses);

        // Preserve the existing status if it's already set to 'responded'
        if (enquiry.status === 'responded') {
          console.log('Preserving responded status for enquiry:', enquiry.id);
          return {
            ...enquiry,
            status: 'responded',
            buyerReply: responses.length > 0 ? responses[responses.length - 1].message : undefined
          };
        }

        // Start with current status or default to 'active'
        let status = enquiry.status || 'active';
        console.log('Initial status:', status);

        // Only update status if it's not already 'selected' (highest priority)
        if (status !== 'selected') {
          const hasAcceptedResponse = responses.some(r => r.status === 'accepted');
          const hasRejectedResponse = responses.some(r => r.status === 'rejected');
          const responseStatuses = responses.map(r => r.status);

          console.log('Response analysis:', {
            responseCount: responses.length,
            responseStatuses,
            hasAcceptedResponse,
            hasRejectedResponse
          });

          // Status priority: selected > Rejected > responded > active
          if (hasAcceptedResponse) {
            status = 'selected';
            console.log('Status updated to: selected (has accepted response)');
          } else if (hasRejectedResponse) {
            status = 'Rejected';
            console.log('Status updated to: Rejected (has rejected response)');
          } else if (responses.length > 0) {
            status = 'responded';
            console.log('Status updated to: responded (has responses)');
          } else if (!status) {
            status = 'active';
            console.log('Status set to: active (no status and no responses)');
          }
        } else {
          console.log('Keeping status as selected (highest priority)');
        }

        const updatedEnquiry = {
          ...enquiry,
          status,
          buyerReply: responses.length > 0 ? responses[responses.length - 1].message : undefined,
          lastModified: enquiry.lastModified || enquiry.createdAt,
          // Ensure we have a created date for sorting
          createdAt: enquiry.createdAt || new Date().toISOString()
        };

        console.log('Final enquiry data:', updatedEnquiry);
        console.groupEnd();
        return updatedEnquiry;
      })
      // Sort by created date (newest first)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

    // Only update if there are actual changes to prevent infinite loops
    console.log('Checking if state update is needed...');
    setEnquiries(prevEnquiries => {
      const prevIds = new Set(prevEnquiries.map(e => e.id));
      const newIds = new Set(updatedStoredEnquiries.map(e => e.id));

      // Check for added/removed enquiries
      const hasDifferentIds = prevIds.size !== newIds.size ||
        !Array.from(prevIds).every(id => newIds.has(id));

      // Check for status changes
      const statusChanges = updatedStoredEnquiries
        .map(e => {
          const prev = prevEnquiries.find(p => p.id === e.id);
          return prev ? { id: e.id, from: prev.status, to: e.status } : null;
        })
        .filter(change => change && change.from !== change.to);

      const hasStatusChanges = statusChanges.length > 0;
      const shouldUpdate = hasDifferentIds || hasStatusChanges;

      console.log('State update check:', {
        prevEnquiryCount: prevEnquiries.length,
        newEnquiryCount: updatedStoredEnquiries.length,
        hasDifferentIds,
        hasStatusChanges,
        statusChanges,
        shouldUpdate
      });

      if (shouldUpdate) {
        console.log('Updating enquiries state with new data');
        console.log('Previous enquiries:', prevEnquiries);
        console.log('New enquiries:', updatedStoredEnquiries);
        return updatedStoredEnquiries;
      }

      console.log('No changes detected, skipping state update');
      return prevEnquiries;
    });

    console.groupEnd(); // End of REFRESH ENQUIRIES group
  };

  // Filter enquiries only when Apply clicked (excluding expired and skipped ones)
  const filteredEnquiries = sortEnquiries(activeEnquiries.filter(enquiry => {
    // Skip any enquiries with 'closed' status (skipped)
    if (enquiry.status === 'closed') return false;

    const matchesSearch =
      searchFilter === '' ||
      enquiry.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      enquiry.productName.toLowerCase().includes(searchFilter.toLowerCase());

    const normalized = statusFilter === '' ? '' : statusFilter; // '' or one of: all/new/viewed/contacted/negotiating
    const allowedStatuses = statusMap[normalized] ?? [];
    const matchesStatus =
      normalized === '' || normalized === 'all' || allowedStatuses.includes(enquiry.status);

    return matchesSearch && matchesStatus;
  }));

  const totalPages = Math.ceil(filteredEnquiries.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredEnquiries.length);
  const paginatedEnquiries = filteredEnquiries.slice(startIndex, endIndex);

  const handleViewClick = async (enquiry: any) => {
    console.group('=== handleViewClick ===');
    console.log('Initial enquiry:', {
      id: enquiry.id,
      currentStatus: enquiry.status,
      hasResponses: getResponsesByRequirementId(enquiry.id).length > 0
    });

    // If status is 'active', update it to 'responded' in the backend
    if (enquiry.status === 'active') {
      try {
        console.log('1. Starting status update from active to responded');

        // First, update in the backend
        console.log('2. Calling updateRequirementStatus with:', {
          id: enquiry.id,
          status: 'viewed'
        });

        await updateRequirementStatus(enquiry.id.toString(), 'viewed');
        console.log('3. Backend update completed');

        // Get the latest data from the store
        const allRequirements = getRequirementsAsEnquiries();
        console.log('4. Latest requirements from store:', allRequirements);

        // Find the updated requirement
        const updatedRequirement = allRequirements.find(req => req.id === enquiry.id);
        console.log('5. Updated requirement from store:', updatedRequirement);

        if (updatedRequirement) {
          // Create the updated enquiry with the latest data
          const updatedEnquiry = {
            ...enquiry,
            status: 'viewed',
            lastModified: new Date().toISOString()
          };

          console.log('6. Updating local state with:', updatedEnquiry);

          // Update the local state with the latest data
          setEnquiries(prevEnquiries =>
            prevEnquiries.map(e =>
              e.id === enquiry.id ? updatedEnquiry : e
            )
          );

          setSelectedEnquiry(updatedEnquiry);

          // Also update the requirement in the store to ensure consistency
          const updatedRequirements = allRequirements.map(req =>
            req.id === enquiry.id ? { ...req, status: 'viewed' } : req
          );

          console.log('7. Updated all requirements:', updatedRequirements);
        }
      } catch (error) {
        console.error('Error updating enquiry status:', error);
        // If update fails, revert the local state
        setSelectedEnquiry({ ...enquiry, status: 'active' });
      }
    } else {
      setSelectedEnquiry(enquiry);
    }
    setResponseModalOpen(true);
  };

  const handleResponsesClick = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setResponseListModalOpen(true);
  };

  const handleChatClick = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setChatModalOpen(true);

    // Update status to 'responded' if it was 'pending' and this is from stored requirements
    if (enquiry.status === 'pending' && enquiry.id > 1000) { // Assuming stored enquiries have higher IDs
      updateRequirementStatus(enquiry.id.toString(), 'responded');
    }
  };

  const handleApplyFilters = () => {
    setSearchFilter(tempSearchFilter);
    setStatusFilter(tempStatusFilter);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  const handleCancelFilters = () => {
    // Clear both applied and temporary filters
    setSearchFilter('');
    setStatusFilter('');
    setTempSearchFilter('');
    setTempStatusFilter('');
    setFilterOpen(false);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 text-primary" />
      : <ArrowDown className="h-4 w-4 text-primary" />;
  };

  const validateQuantity = (quantity: string) => {
    if (!selectedEnquiry) return false;

    const requiredQty = Number(selectedEnquiry.quantity.replace(/[^0-9]/g, '')); // Extract numeric part
    const availableQty = Number(quantity);

    if (isNaN(availableQty)) {
      setQuantityError('Please enter a valid quantity');
      return false;
    }

    if (availableQty > requiredQty) {
      setQuantityError(`Available quantity cannot be more than required quantity (${requiredQty}kg)`);
      return false;
    }

    setQuantityError('');
    return true;
  };

  const resetForm = () => {
    setSelectedEnquiry(null);
    setMerchantPrice('');
    setAvailableQuantity('');
    setRemarks('');
    setResponseModalOpen(false);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setMerchantPrice(value);

    // Validation logic
    if (!selectedEnquiry.allowLowerBid && parseFloat(value) < selectedEnquiry.expectedPrice) {
      setError(`Price cannot be lower than expected price ₹${selectedEnquiry.expectedPrice}`);
    } else {
      setError(""); // clear error if valid
    }
  }

  const handleSubmitResponse = async () => {
    console.group('=== HANDLE SUBMIT RESPONSE ===');
    console.log('Action type:', actionType);
    console.log('Selected enquiry:', selectedEnquiry);

    if (actionType === 'skip') {
      try {
        console.log('Processing skip action...');

        // Add the skipped response

        // Update the requirement status to 'closed' for the skipped enquiry
        console.log(`Updating requirement ${selectedEnquiry.id} status to 'closed'`);
        await updateRequirementStatus(selectedEnquiry.id.toString(), 'closed');

        // Get fresh list of enquiries after update
        console.log('Fetching updated enquiries after status update...');
        const updatedEnquiries = getRequirementsAsEnquiries();
        console.log('Updated enquiries:', updatedEnquiries);

        // Filter out the skipped enquiry from the current list
        const filteredEnquiries = updatedEnquiries.filter(
          (enquiry) => enquiry.id !== selectedEnquiry.id
        );
        console.log('Filtered enquiries (after removing skipped):', filteredEnquiries);

        // Update the state with filtered enquiries
        console.log('Updating local state to remove skipped enquiry');
        setEnquiries(prevEnquiries => {
          const filtered = prevEnquiries.filter(enquiry => enquiry.id !== selectedEnquiry.id);
          console.log('Previous enquiries:', prevEnquiries);
          console.log('After removing skipped enquiry:', filtered);
          return filtered;
        });

        toast({
          title: 'Skipped',
          description: 'Enquiry has been skipped and removed from your list',
        });

        // Close the modal and reset form
        console.log('Closing modal and resetting form');
        setResponseModalOpen(false);
        resetForm();
      } catch (error) {
        console.error('Error updating requirement status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update enquiry status',
          variant: 'destructive',
        });
      }
      return;
    }

    // For quotes and selected actions, validate fields
    if (actionType === 'quotes' && (!merchantPrice || !availableQuantity)) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (actionType === 'quotes' && !validateQuantity(availableQuantity)) {
      return;
    }

    try {
      // Prepare response data
      if (actionType === 'quotes') {
        // Get merchant details from profile or user
        const merchantName = profile?.name || user?.fullName || 'Merchant';
        const merchantLocation = profile?.city || 'Location not specified';

        const responseData = {
          requirementId: selectedEnquiry.id.toString(),
          merchantId: user?.id || 'unknown',
          merchantName: merchantName,
          merchantLocation: merchantLocation,
          price: merchantPrice,
          responseDate: new Date().toISOString(),
          status: 'new' as const,
          grade: selectedEnquiry.grade || '',
          quantity: availableQuantity,
          origin: selectedEnquiry.origin || '',
          certifications: [],
          deliveryTime: 'TBD',
          contact: '',
          message: remarks,
          remarks: remarks,
          productName: selectedEnquiry.productName || '', // <-- Added this line
          requirementTitle: selectedEnquiry.productName,
          requirementQuantity: selectedEnquiry.quantity,
          requirementGrade: selectedEnquiry.grade,
          requirementOrigin: selectedEnquiry.origin,
        };

        // Add response to the system
        addResponse(responseData);
      }
      // Determine the new status based on action
      const newStatus = actionType === 'selected' ? 'selected' :
        actionType === 'quotes' ? 'responded' : 'closed';
      console.log('=== STATUS UPDATE START ===');
      console.log('Action type:', actionType);
      console.log('New status to set:', newStatus);
      console.log('Current enquiry status:', selectedEnquiry.status);
      console.log('Enquiry ID:', selectedEnquiry.id);

      try {
        console.log('Calling updateRequirementStatus with:', {
          id: selectedEnquiry.id,
          status: newStatus
        });

        // Update the status in the store
        await updateRequirementStatus(selectedEnquiry.id.toString(), newStatus);

        // Force a refresh of the enquiries list to ensure UI is up to date
        console.log('Refreshing enquiries after status update...');
        refreshEnquiries();

        // Also update the selected enquiry in the modal if it's open
        if (selectedEnquiry) {
          console.log('Updating selected enquiry in modal...');
          setSelectedEnquiry(prev => ({
            ...prev!,
            status: newStatus === 'selected' ? 'selected' : prev?.status
          }));
        }
        console.log('updateRequirementStatus completed');

        // Refresh the enquiries to get the latest data
        console.log('Refreshing enquiries...');
        refreshEnquiries();

        // Also update the local state for immediate UI update
        if (newStatus === 'closed') {
          console.log('Removing closed enquiry from UI');
          setEnquiries(prevEnquiries =>
            prevEnquiries.filter(e => e.id !== selectedEnquiry.id)
          );
        } else {
          console.log('Updating status in local state to:', newStatus);
          setEnquiries(prevEnquiries =>
            prevEnquiries.map(e =>
              e.id === selectedEnquiry.id
                ? { ...e, status: newStatus }
                : e
            )
          );
        }

        toast({
          title: 'Success',
          description:
            actionType === 'selected'
              ? 'Enquiry has been marked as selected'
              : 'Enquiry has been skipped and removed from the list',
        });

        // Reset form and close modal
        resetForm();
        setResponseModalOpen(false);

        // If we didn't remove the item, refresh the list to ensure consistency
        if (newStatus !== 'closed') {
          refreshEnquiries();
        }
      } catch (error) {
        console.error('Error updating status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update enquiry status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit response. Please try again.',
        variant: 'destructive',
      });
    }
  };

  type ResponseStatus = 'new' | 'viewed' | 'accepted' | 'rejected' | 'skipped';

  const handleStatusChange = async (responseId: string, newStatus: ResponseStatus) => {
    console.log('=== HANDLE STATUS CHANGE START ===');
    console.log('Response ID:', responseId);
    console.log('New status:', newStatus);
    console.log('Selected enquiry:', selectedEnquiry);

    try {
      console.log('Updating response status...');
      await updateResponseStatus(responseId, newStatus);
      console.log('Response status updated');

      // If we have a selected enquiry
      if (selectedEnquiry) {
        console.log('Selected enquiry ID:', selectedEnquiry.id);
        console.log('Current enquiry status:', selectedEnquiry.status);

        if (newStatus === 'accepted') {
          console.log('Updating requirement status to "selected"...');
          await updateRequirementStatus(selectedEnquiry.id, 'selected');
          console.log('Requirement status updated to "selected"');

          // Update the selected enquiry in the list
          console.log('Updating local enquiries list...');
          setEnquiries(prevEnquiries => {
            const updated = prevEnquiries.map(e =>
              e.id === selectedEnquiry.id
                ? { ...e, status: 'selected' }
                : e
            );
            console.log('Updated enquiries list:', updated);
            return updated;
          });
        } else if (newStatus === 'skipped') {
          console.log('Skipping enquiry, removing from list...');
          // Remove the skipped enquiry from the list
          setEnquiries(prevEnquiries =>
            prevEnquiries.filter(e => e.id !== selectedEnquiry.id)
          );

          // Show success message
          toast({
            title: 'Skipped',
            description: 'The enquiry has been skipped and removed from your list',
          });

          // Close any open modals
          setViewModalOpen(false);
          setResponseModalOpen(false);
          return; // Exit early since we've handled the skip
        }

        // Update the selected enquiry in the modal
        console.log('Updating selected enquiry in modal...');
        setSelectedEnquiry(prev => {
          const updated = {
            ...prev!,
            status: newStatus === 'accepted' ? 'selected' : prev?.status
          };
          console.log('Updated selected enquiry:', updated);
          return updated;
        });
      }

      // Show success message
      toast({
        title: 'Status updated',
        description: `Response has been ${newStatus.toLowerCase()}`,
      });

      // Refresh the enquiries to ensure everything is in sync
      refreshEnquiries();
    } catch (error) {
      console.error('Error updating response status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update response status',
        variant: 'destructive',
      });
    }
  };

  const handleActionChange = (action: 'skip' | 'selected' | 'quotes') => {
    setActionType(action);
    setQuantityError('');
  };

  return (
    <div className="merchant-theme p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Buyer Enquiries</h1>
          <p className="text-muted-foreground mt-2">
            Manage enquiries from buyers about your products
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setFilterOpen(prev => !prev)}>
          <Filter className="h-4 w-4 mr-2" />
          Filter Enquiries
        </Button>
      </div>

      {/* Filters */}
      {filterOpen && (
        <Card>
          <CardHeader></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search customer, product..."
                    className="pl-8"
                    value={tempSearchFilter}
                    onChange={(e) => setTempSearchFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter by Status — shadcn/ui Select (exact structure you asked for) */}
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                <Select
                  value={tempStatusFilter}
                  onValueChange={(value) => setTempStatusFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">Pending</SelectItem>
                    <SelectItem value="viewed">Responded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={handleCancelFilters}>Cancel</Button>
              <Button onClick={handleApplyFilters}>Apply</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enquiries Table */}
      <Card>
        <CardHeader>
          {/* <CardTitle>Product Enquiries</CardTitle> */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center justify-between">
                    Buyer Name
                    {getSortIcon('customerName')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('productName')}
                >
                  <div className="flex items-center justify-between">
                    Product
                    {getSortIcon('productName')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center justify-between">
                    Required Qty (kg)
                    {getSortIcon('quantity')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('expectedPrice')}
                >
                  <div className="flex items-center justify-between">
                    Expected Price
                    {getSortIcon('expectedPrice')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('deliveryDeadline')}
                >
                  <div className="flex items-center justify-between">
                    Expected Date
                    {getSortIcon('deliveryDeadline')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center justify-between">
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEnquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell className="font-medium">{enquiry.customerName}</TableCell>
                  <TableCell>{enquiry.productName}</TableCell>
                  <TableCell>{enquiry.quantity}</TableCell>
                  <TableCell>₹{enquiry.expectedPrice}/kg</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{new Date(enquiry.deliveryDeadline).toLocaleDateString()}</span>
                      {isExpiringSoon(enquiry) && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      enquiry.status === 'pending'
                        ? 'default'
                        : enquiry.status === 'active'
                          ? 'secondary'
                          : enquiry.status === 'responded' || enquiry.status === 'viewed'
                            ? 'default'
                            : enquiry.status === 'selected'
                              ? 'outline'
                              : enquiry.status === 'confirmed'
                                ? 'outline'
                                : enquiry.status === 'closed'
                                  ? 'destructive'
                                  : 'default'
                    }>
                      {enquiry.status === 'closed'
                        ? 'Skipped'
                        : enquiry.status === 'selected'
                          ? 'Selected'
                          : enquiry.status === 'active'
                            ? 'New'
                            : enquiry.status === 'responded' ? 'Responded' : enquiry.status === 'viewed'
                              ? 'Viewed'
                              : enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewClick(enquiry)} title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleChatClick(enquiry)} title="View Responses">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEnquiries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    No enquiries found for selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredEnquiries.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {endIndex} of {filteredEnquiries.length} enquiries
              </div>

              <div className="flex items-center space-x-4">
                <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[100px]"><SelectValue placeholder="Page size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Response Modal */}
      <Dialog open={responseModalOpen} onOpenChange={setResponseModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>View Details & Take Action</DialogTitle>
            <DialogDescription>
              Enquiry from {selectedEnquiry?.customerName} for {selectedEnquiry?.productName}
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              {/* Enquiry Details */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Buyer Message:</h4>
                <p className="text-sm text-muted-foreground">{selectedEnquiry?.message || "Customer is interested in your product."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Buyer Name</Label>
                  <p className="font-medium">{selectedEnquiry.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <p className="font-medium">{selectedEnquiry.productName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Required Qty</Label>
                  <p className="font-medium">{selectedEnquiry.quantity} Kg</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Minimum Qty</Label>
                  <p className="font-medium">{selectedEnquiry.minSupplyQuantity} Kg</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Expected Price</Label>
                  <p className="font-medium">₹{selectedEnquiry.expectedPrice}/kg</p>
                </div>

              </div>

              <div className="flex border rounded-md p-0.5 bg-muted/50 mt-2">
                <button
                  onClick={() => handleActionChange('skip')}
                  className={`flex-1 py-1.5 text-sm font-medium transition-colors rounded-sm ${actionType === 'skip'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'text-muted-foreground hover:text-foreground/80'
                    }`}
                >
                  Skip
                </button>
                <div className="w-px bg-border my-1.5" />
                <button
                  onClick={() => handleActionChange('selected')}
                  className={`flex-1 py-1.5 text-sm font-medium transition-colors rounded-sm ${actionType === 'selected'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'text-muted-foreground hover:text-foreground/80'
                    }`}
                >
                  Selected
                </button>
                <div className="w-px bg-border my-1.5" />
                <button
                  onClick={() => handleActionChange('quotes')}
                  className={`flex-1 py-1.5 text-sm font-medium transition-colors rounded-sm ${actionType === 'quotes'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'text-muted-foreground hover:text-foreground/80'
                    }`}
                >
                  Send Quote
                </button>
              </div>

              {actionType === 'quotes' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Supply Quantity (kg) *</Label>
                      <Input
                        id="availableQuantity"
                        type="number"
                        placeholder={`Min: ${selectedEnquiry?.minSupplyQuantity}kg | Max: ${selectedEnquiry?.quantity}kg`}
                        value={availableQuantity}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setAvailableQuantity(e.target.value);

                          if (!value) {
                            setQuantityError("Quantity is required");
                          } else if (value < selectedEnquiry?.minSupplyQuantity) {
                            setQuantityError(`Quantity should not be less than ${selectedEnquiry?.minSupplyQuantity}kg`);
                          } else if (value > selectedEnquiry?.quantity) {
                            setQuantityError(`Quantity should not exceed ${selectedEnquiry?.quantity}kg`);
                          } else {
                            setQuantityError(""); // clear error
                          }
                        }}
                        className={`border-input ${quantityError ? 'border-red-500' : ''}`}
                        min={selectedEnquiry?.minQuantity || 0}
                        max={selectedEnquiry?.quantity || undefined}
                        step="0.01"
                      />
                      {quantityError && (
                        <p className="text-sm text-red-500 mt-1">{quantityError}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Your Price (₹) *</Label>
                      <Input
                        id="merchantPrice"
                        type="number"
                        placeholder="Enter your price per kg"
                        value={merchantPrice}
                        onChange={handlePriceChange}
                        className={`border - input ${error ? "border-red-500" : ""}`}
                        min="0"
                        step="0.01"
                      />
                      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="replyMessage">Remarks</Label>
                    <Textarea
                      id="replyMessage"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Type your reply message to the customer..."
                      rows={3}
                      className="border-input focus:ring-ring"
                    />
                  </div>
                </>
              )}

              {actionType !== 'quotes' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This action will mark the enquiry as <span className="font-bold">{actionType}</span>.
                        {actionType === 'skip' ? ' The enquiry will be removed from your active list.' : ' You can provide additional details if needed.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {/* Primary Button using theme */}
                <Button
                  onClick={handleSubmitResponse}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {actionType === 'skip' ? 'Submit' :
                    actionType === 'selected' ? 'Submit' : 'Submit'}
                </Button>

                {/* Outline Button using theme */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setResponseModalOpen(false);
                    setMerchantPrice('');
                    setAvailableQuantity('');
                    setRemarks('');
                    setActionType('quotes');
                    setQuantityError('');
                  }}
                  className="text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </Button>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Responses Modal */}
      <Dialog open={responseListModalOpen} onOpenChange={setResponseListModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Merchant Responses</DialogTitle>
            <DialogDescription>View all responses for this requirement</DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              {getResponsesByRequirementId(selectedEnquiry.id.toString()).map((response) => (
                <Card key={response.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{response.merchantName}</h3>
                      <p className="text-sm text-muted-foreground">Origin: {response.origin}</p>
                      <p className="text-sm text-muted-foreground">Contact: {response.contact}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium ml-2">{response.price}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Available Qty:</span>
                        <span className="font-medium ml-2">{response.quantity}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Message:</span>
                        <p className="text-sm mt-1">{response.message}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={response.status === 'new' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusChange(response.id, 'new')}
                        >
                          New
                        </Button>
                        <Button
                          variant={response.status === 'accepted' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusChange(response.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant={response.status === 'rejected' ? 'destructive' : 'outline'}
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStatusChange(response.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {getResponsesByRequirementId(selectedEnquiry.id.toString()).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No responses yet for this requirement.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        customerName={selectedEnquiry?.customerName || ''}
        productName={selectedEnquiry?.productName || ''}
        userType="merchant"
        enquiry={selectedEnquiry}
      />
    </div>
  );
};

export default MerchantEnquiries;