type WaitlistFields = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  persona: string | null;
  interests: string[];
  note: string | null;
  created_at: string;
};

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type CustomerRow = WaitlistFields;
type CustomerInsert = Omit<WaitlistFields, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

type VendorRow = WaitlistFields & { business_name: string | null };
type VendorInsert = Omit<CustomerInsert, "full_name"> & {
  full_name: string;
  business_name: string | null;
};

export type MarketplaceDatabase = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      customer_waitlist: Table<CustomerRow, CustomerInsert, Partial<CustomerInsert>>;
      vendor_waitlist: Table<VendorRow, VendorInsert, Partial<VendorInsert>>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
