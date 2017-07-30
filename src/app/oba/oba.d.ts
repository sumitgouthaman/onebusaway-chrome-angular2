export interface Region {
  obaBaseUrl: string;
  regionName: string;
}

export class Stop {
  code: string;
  direction: string;
  formattedDirection: string;
  id: string;
  name: string;
}
