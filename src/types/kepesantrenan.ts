export interface Room {
  id: number;
  name: string;
  hostel_id: number;
  capacity: number;
  description: string;
  is_active: boolean;
  hostel: {
    id: number;
    name: string;
  };
}

export interface CreateUpdateRoomRequest {
  name: string;
  hostel_id: number;
  capacity: number;
  description?: string;
  is_active?: boolean;
}