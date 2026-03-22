declare module "thai-address-database" {
  interface AddressEntry {
    district: string;
    amphoe: string;
    province: string;
    zipcode: number;
  }
  export function searchAddressByProvince(province: string): AddressEntry[];
  export function searchAddressByAmphoe(amphoe: string): AddressEntry[];
  export function searchAddressByDistrict(district: string): AddressEntry[];
  export function searchAddressByZipcode(zipcode: string | number): AddressEntry[];
}
