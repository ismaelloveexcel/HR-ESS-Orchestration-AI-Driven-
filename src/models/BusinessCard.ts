/**
 * Digital Business Card Model
 * 
 * Configurable business card that can be saved as vCard,
 * displayed via QR code, and has admin-controlled visibility.
 */

// Fields that can be shown on business card
export interface BusinessCardFields {
  // Always visible
  name: boolean;
  position: boolean;
  entityName: boolean;
  
  // Configurable by admin
  email: boolean;
  phone: boolean;
  mobile: boolean;
  department: boolean;
  location: boolean;
  website: boolean;
  linkedIn: boolean;
  photo: boolean;
  
  // Custom fields
  customField1?: { label: string; visible: boolean };
  customField2?: { label: string; visible: boolean };
  customField3?: { label: string; visible: boolean };
}

// Business card data
export interface BusinessCard {
  employeeId: string;
  entityCode: string;
  
  // Card content
  name: string;
  firstName: string;
  lastName: string;
  position: string;
  entityName: string;
  department?: string;
  
  // Contact info
  email?: string;
  phone?: string;
  mobile?: string;
  
  // Additional info
  location?: string;
  website?: string;
  linkedIn?: string;
  photo?: string;
  
  // Custom fields
  customFields?: { label: string; value: string }[];
  
  // Visibility settings (controlled by admin)
  visibility: BusinessCardFields;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Default visibility settings
export const DEFAULT_VISIBILITY: BusinessCardFields = {
  name: true,
  position: true,
  entityName: true,
  email: true,
  phone: true,
  mobile: true,
  department: true,
  location: false,
  website: true,
  linkedIn: false,
  photo: true
};

// vCard generation
export function generateVCard(card: BusinessCard): string {
  const v = card.visibility;
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0'
  ];

  // Name (always included)
  lines.push(`N:${card.lastName};${card.firstName};;;`);
  lines.push(`FN:${card.name}`);

  // Organization
  if (v.entityName) {
    lines.push(`ORG:${card.entityName}${v.department && card.department ? `;${card.department}` : ''}`);
  }

  // Position
  if (v.position) {
    lines.push(`TITLE:${card.position}`);
  }

  // Email
  if (v.email && card.email) {
    lines.push(`EMAIL;TYPE=WORK:${card.email}`);
  }

  // Phone
  if (v.phone && card.phone) {
    lines.push(`TEL;TYPE=WORK:${card.phone}`);
  }

  // Mobile
  if (v.mobile && card.mobile) {
    lines.push(`TEL;TYPE=CELL:${card.mobile}`);
  }

  // Address/Location
  if (v.location && card.location) {
    lines.push(`ADR;TYPE=WORK:;;${card.location};;;;`);
  }

  // Website
  if (v.website && card.website) {
    lines.push(`URL:${card.website}`);
  }

  // LinkedIn
  if (v.linkedIn && card.linkedIn) {
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${card.linkedIn}`);
  }

  // Photo (base64 or URL)
  if (v.photo && card.photo) {
    if (card.photo.startsWith('data:')) {
      const base64 = card.photo.split(',')[1];
      lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${base64}`);
    } else {
      lines.push(`PHOTO;VALUE=URI:${card.photo}`);
    }
  }

  // Custom fields as notes
  if (card.customFields && card.customFields.length > 0) {
    const visibleCustom = card.customFields.filter((_, i) => {
      const key = `customField${i + 1}` as keyof BusinessCardFields;
      const setting = v[key] as { visible: boolean } | undefined;
      return setting?.visible !== false;
    });
    
    if (visibleCustom.length > 0) {
      const note = visibleCustom.map(f => `${f.label}: ${f.value}`).join('\\n');
      lines.push(`NOTE:${note}`);
    }
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

// Generate QR code data URL for contact
export function generateContactQRData(card: BusinessCard): string {
  // Use MECARD format for better compatibility
  const v = card.visibility;
  let mecard = `MECARD:N:${card.lastName},${card.firstName};`;
  
  if (v.entityName) mecard += `ORG:${card.entityName};`;
  if (v.position) mecard += `TITLE:${card.position};`;
  if (v.email && card.email) mecard += `EMAIL:${card.email};`;
  if (v.phone && card.phone) mecard += `TEL:${card.phone};`;
  if (v.mobile && card.mobile) mecard += `TEL:${card.mobile};`;
  if (v.location && card.location) mecard += `ADR:${card.location};`;
  if (v.website && card.website) mecard += `URL:${card.website};`;
  
  mecard += ';';
  return mecard;
}

// Entity-level business card settings
export interface EntityBusinessCardSettings {
  entityCode: string;
  
  // Default visibility for all employees
  defaultVisibility: BusinessCardFields;
  
  // Entity branding
  entityName: string;
  entityWebsite?: string;
  entityLogo?: string;
  
  // Custom fields configuration
  customFields?: {
    field1?: { label: string; enabled: boolean };
    field2?: { label: string; enabled: boolean };
    field3?: { label: string; enabled: boolean };
  };
  
  // Allow employees to edit their own visibility?
  allowEmployeeCustomization: boolean;
  
  updatedAt: string;
}

// Default entity settings
export const DEFAULT_ENTITY_SETTINGS: Omit<EntityBusinessCardSettings, 'entityCode' | 'entityName'> = {
  defaultVisibility: DEFAULT_VISIBILITY,
  allowEmployeeCustomization: false,
  updatedAt: new Date().toISOString()
};
