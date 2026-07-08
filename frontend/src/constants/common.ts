import { AVAILABLE_MODULES } from "@/utils/adminPanel";

export const KEY_BODY = "body";
export const KEY_HEADERS = "headers";
export const ALL_SPEDITIONS_VALUE = "__all__";
export const NEBENKOSTEN_INITIAL_COUNTRIES = ["DE", "INT"];
export const CELL_PX_WIDTH = "130px";
export const TOLL_CHARGE_TYPE_KILOMETER = "kilometer";
export const TOLL_CHARGE_TYPE_ZIPCODE = "zipCode";
export const TOLL_CHARGE_TYPE_FIXED = "fixed";

export const SHIPPER_TENDER_HUB = "shippertenderhub";
export const ROAD_FREIGHT = "roadfreight";  
export const SEAFREIGHT = "seafreight";
export const KEP = "kep";
export const Employee_Management = "EmployeeManagement";
export const ANALYSEN_HUB = "analysenhub";
export const ORDER_HUB = "orderhub";

export const LANGUAGE_FLAGS: any = {
  de: "🇩🇪",
  en: "🇬🇧",
};
export const DEFAULT_DATA_CARRIER = {
  name: "",
  street: "",
  streetNo: "",
  zipCode: "",
  city: "",
  country: "",
  contactName: "",
  phoneNo: "",
  email: "",
  customerNumber: "",
};

export const CALCUTION_TYPE_MAPPER: any = {
  "Lademeter werden berücksichtigt": 2,
  "Kubikmeter werden berücksichtigt": 1,
  "Berechnung nach Effektivgewicht": 0,
  Nein: false,
  Ja: true,
};

export const CALCUTION_TYPE_MAPPER_REVERSE: any = {
  2: "Lademeter werden berücksichtigt",
  1: "Kubikmeter werden berücksichtigt",
  0: "Berechnung nach Effektivgewicht",
  false: "Nein",
  true: "Ja",
};

// terms that must come first in this exact order
export const PRIORITY_ORDER = [
  "Maut",
  "Dieselzuschlag",
  "Express Next Day",
  "Express 12:00 Uhr",
  "Express 10:00 Uhr",
  "Express 08:00 Uhr",
  "Hebebühnenzuschlag",
  "Fixtermin",
  "E-Mail Avis",
  "Telefonisches Avis",
  "Booking in Avis",
  "Gefahrgutzuschlag",
  "Langgutzuschlag", // 👈 moved up
  "Kurzwochenzuschlag",
  "Palettentausch",
  "Gitterboxtausch",
  "Spediteurbescheinigung",
  "B2C Zuschlag (national)",
  "B2C Zuschlag (international)",
  "Security Fee",
  "Versicherung",
  "Porti/Papiere",
  "Eigene 1",
  "Eigene 2",
  "Eigene 3",
  "Eigene 4",
  "Eigene 5",
  "", // flat entry
];

export const EXTRA_CHARGES_MAPPER: any = {
  dieselFee: "Dieselzuschlag",
  expressNextDay: "Nebenkosten Express Next Day",
  liftingPlatformSurcharge: "Nebenkosten Hebebühnenzuschlag",
  phoneAvis: "Nebenkosten Telefonisches Avis",
  dangerousGoodsSurcharge: "Nebenkosten Gefahrgutzuschlag",
  longGoodsSurcharge: "Nebenkosten Langgutzuschlag",
  palletExchange: "Nebenkosten Palettentausch",
  securityFee: "Nebenkosten Security Fee",
  tollCharge: "Maut",
  freightCostSystem: "Frachtgrundpreis",
  express12:"Nebenkosten Express 12:00 Uhr",
  express10:"Nebenkosten Express 10:00 Uhr",
  express8:"Nebenkosten Express 08:00 Uhr",
  tailLiftSurcharge:"Nebenkosten Hebebühnenzuschlag",
  fixtermin:"Nebenkosten Fixtermin",
  emailAvis:"Nebenkosten E-Mail Avis",
  bookingInAvis:"Nebenkosten Booking in Avis",
  shortWeekSurcharge:"Nebenkosten Kurzwochenzuschlag",
palletBoxExchange:"Nebenkosten Gitterboxtausch",  
carrierCertificate:"Nebenkosten Spediteurbescheinigung",
b2cNationalSurcharge:"Nebenkosten B2C Zuschlag (national)",
b2cInternationalSurcharge:"Nebenkosten B2C Zuschlag (international)",
insurance:"Nebenkosten Versicherung",
portiPapiere:"Nebenkosten Porti/Papiere",
custom1:"Nebenkosten Eigene 1",
custom2:"Nebenkosten Eigene 2",
custom3:"Nebenkosten Eigene 3",
custom4:"Nebenkosten Eigene 4",
custom5:"Nebenkosten Eigene 5",



};

export const EXTRA_CHARGES_MAPPER_EN: any = {
  dieselFee: "Fuel Surcharge",
  expressNextDay: "Express Next Day Charges",
  liftingPlatformSurcharge: "Tail Lift Surcharge",
  phoneAvis: "Surcharge Phone Avis",
  dangerousGoodsSurcharge: "Surcharge Dangerous Goods Surcharge",
  longGoodsSurcharge: "Surcharge Loong Goods Surcharge",
  palletExchange: "Surcharge Pallet Exchange",
  securityFee: "Surcharge Security Fee",
  tollCharge: "Toll Charge",
  freightCostSystem: "Base Freight Cost",
    express12:"Surcharge Express 12:00 Uhr",
    express10:"Surcharge Express 10:00 Uhr",
    express8:"Surcharge Express 08:00 Uhr",
    tailLiftSurcharge:"Surcharge Tail Lift Surcharge",
     fixtermin:"Surcharge Fixtermin",
     emailAvis:"Surcharge E-Mail Avis",
     bookingInAvis:"Surcharge Booking In Avis",
      shortWeekSurcharge:"Surcharge Short Week Surcharge",
      palletBoxExchange:"Surcharge Pallet Box Exchange", 
      carrierCertificate:"Surcharge Carrier Certificate",
      b2cNationalSurcharge:"Surcharge B2C National Surcharge",
      b2cInternationalSurcharge:"Surcharge B2C International Surcharge",
      insurance:"Surcharge Insurance",
     portiPapiere:"Surcharge Porti Papiere",
      custom1:"Surcharge Custom 1",
      custom2:"Surcharge Custom 2",
      custom3:"Surcharge Custom 3",
      custom4:"Surcharge Custom 4",
      custom5:"Surcharge Custom 5",







};

export const SHOW_BUTTON: any = {
  "Express Next Day": "Öffnen",
  Langgutzuschlag: "Öffnen",
  Dieselzuschlag: "Öffnen",
  Umweltzuschlag: "Öffnen",
  "Express 12:00 Uhr": "Öffnen",
  "Express 10:00 Uhr": "Öffnen",
  "Express 08:00 Uhr": "Öffnen",
  Hebebühnenzuschlag: "Öffnen",
   Maut: "Öffnen",
};

export const SHOW_LENGTH: any = { Langgutzuschlag: "Langgutzuschlag" };

export const DIESEL_FLOATER_SOURCE_ALIASES: Record<string, string> = {
  EN2X: "EN2X",
  EN2X2: "EN2X (-2 Mon.)",
  BGL: "BGL",
  BGL2: "BGL (-2 Mon.)",
  Shell: "Shell",
  Shell2: "Shell (-2 Mon.)",
  Aral: "Aral",
  Aral2: "Aral (-2 Mon.)",
  EUCommission: "EU Commission",
  EUCommission2: "EU Commission (-2 Mon.)",
  Benzinpreisde: "Benzinpreis.de",
  ADAC: "ADAC",
  ADAC2: "ADAC (-2 Mon.)",
};

export const KEYS_NEEDED_CORRECTION = [
  "palletCount",
  "packagingType",
  "phoneAvis",
];
export const LABLE_NEEDED_CORRECTION: any = {
  palletCount: "Palettenanzahl",
  packagingType: "Verpackungstyp",
  phoneAvis: "Telefonisches Avis",
};

export const HIDE_INVOICE_COMMUNICATION = [
  "MANUALLY ACCEPTED",
  "MANUALLY REJECTED",
];

export const CSV_IMPORT_CONFIGURE = {
  delimiter: ";",
  encoding: "UTF-8",
  skipEmptyLines: true,

  transform: (value: any) => value?.trim(),
};

export const ROLE_ADMIN = "ADMIN";
export const ROLE_USER = "USER";
export const ROLE_EMPLOYEE = "EMPLOYEE";










