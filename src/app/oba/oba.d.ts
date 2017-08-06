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
  region: Region;
}

export class ArrivalDeparture {
  routeLongName: string;
  routeShortName: string;
  scheduledArrivalTime: number;
  relativeScheduledArrivalTime: string;
  predictedArrivalTime: number;
  relativePredictedArrivalTime: string;
  tripHeadsign: string;
}