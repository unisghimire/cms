// Enum for lead status tracking
export enum LeadStatus {
  New = 'new',
  InitialContact = 'initial_contact',
  DocumentCollection = 'document_collection',
  AssessmentCompleted = 'assessment_completed',
  VisaApplicationSubmitted = 'visa_application_submitted',
  VisaApproved = 'visa_approved',
  VisaRejected = 'visa_rejected',
  VisaIssued = 'visa_issued',
  Lost = 'lost'
}

// Enum for lead source tracking
export enum LeadSource {
  Website = 'website',
  Referral = 'referral',
  SocialMedia = 'social_media',
  EmailCampaign = 'email_campaign',
  WalkIn = 'walk_in',
  PhoneInquiry = 'phone_inquiry',
  Other = 'other'
}

// Enum for visa types
export enum VisaType {
  Student = 'student',
  Work = 'work',
  Business = 'business',
  Tourist = 'tourist',
  FamilySponsorship = 'family_sponsorship',
  PermanentResidence = 'permanent_residence',
  Other = 'other'
}

// Enum for target countries
export enum TargetCountry {
  Canada = 'canada',
  Australia = 'australia',
  UnitedKingdom = 'united_kingdom',
  UnitedStates = 'united_states',
  NewZealand = 'new_zealand',
  Germany = 'germany',
  France = 'france',
  Other = 'other'
}

// Enum for education levels
export enum EducationLevel {
  HighSchool = 'high_school',
  Diploma = 'diploma',
  Bachelors = 'bachelors',
  Masters = 'masters',
  PhD = 'phd',
  Other = 'other'
}

// Interface for lead information
export interface Lead {
  // Unique identifier
  id: string;
  
  // Personal information
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  current_country: string;
  
  // Contact information
  email: string;
  phone: string;
  alternate_phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  
  // Education information
  education_level: EducationLevel;
  current_education?: string;
  institution_name?: string;
  graduation_year?: number;
  
  // Work experience
  current_occupation?: string;
  years_of_experience?: number;
  current_employer?: string;
  
  // Immigration details
  visa_type: VisaType;
  target_country: TargetCountry;
  target_course?: string;
  target_institution?: string;
  target_intake?: string;
  
  // Lead details
  status: LeadStatus;
  source: LeadSource;
  source_details?: string;
  
  // Financial information
  budget_range?: string;
  funding_source?: string[];
  
  // Notes and additional information
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Assigned to
  assigned_to?: string;
}

// Interface for document information
export interface Document {
  // Unique identifier
  id: string;
  
  // Reference to lead
  lead_id: string;
  
  // Document information
  document_type: string;
  document_name: string;
  document_url: string;
  document_size: number;
  document_type_mime: string;
  
  // Document status
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  
  // Notes
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Interface for visa application information
export interface VisaApplication {
  // Unique identifier
  id: string;
  
  // Reference to lead
  lead_id: string;
  
  // Application details
  application_number: string;
  visa_type: VisaType;
  target_country: TargetCountry;
  application_status: string;
  
  // Important dates
  submission_date?: string;
  processing_start_date?: string;
  expected_decision_date?: string;
  decision_date?: string;
  
  // Application details
  course_details?: {
    course_name: string;
    duration: string;
    start_date: string;
    tuition_fee: number;
    other_fees: number;
  };
  institution_details?: {
    name: string;
    location: string;
    ranking?: number;
    acceptance_rate?: number;
  };
  financial_details?: {
    total_cost: number;
    funding_sources: string[];
    scholarships?: string[];
  };
  
  // Fees and payments
  application_fee?: number;
  service_fee?: number;
  payment_status: string;
  
  // Notes
  notes?: string;
  
  // Created by
  created_by: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Interface for lead activity information
export interface LeadActivity {
  // Unique identifier
  id: string;
  
  // Reference to lead
  lead_id: string;
  
  // Activity details
  activity_type: string;
  description: string;
  
  // Meeting details
  meeting_date?: string;
  meeting_duration?: string;
  meeting_notes?: string;
  
  // Follow-up details
  follow_up_date?: string;
  follow_up_notes?: string;
  
  // Document collection status
  documents_collected?: string[];
  documents_pending?: string[];
  
  // Performed by
  performed_by: string;
  
  // Timestamps
  created_at: string;
}

// Interface for lead with all related information
export interface LeadWithDetails extends Lead {
  documents: Document[];
  activities: LeadActivity[];
  visa_applications: VisaApplication[];
}

// Make the file a module
export {}; 