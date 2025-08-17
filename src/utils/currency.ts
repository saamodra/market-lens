/**
 * Currency formatting utilities
 */

export const formatCurrency = (amount: number | null, currency: string): string => {
  if (amount === null) {
    return 'N/A';
  }

  switch (currency.toUpperCase()) {
    case 'IDR':
    case 'IDR.JK':
      return `Rp${amount.toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    case 'USD':
    case 'USD.NASDAQ':
    case 'USD.NYSE':
      return `$${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    case 'EUR':
      return `€${amount.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    case 'GBP':
      return `£${amount.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    case 'JPY':
      return `¥${amount.toLocaleString('ja-JP', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`;

    case 'CNY':
      return `¥${amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    case 'KRW':
      return `₩${amount.toLocaleString('ko-KR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`;

    case 'SGD':
      return `S$${amount.toLocaleString('en-SG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    case 'MYR':
      return `RM${amount.toLocaleString('ms-MY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    case 'THB':
      return `฿${amount.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    case 'PHP':
      return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    case 'VND':
      return `₫${amount.toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`;

    default:
      // For unknown currencies, use the currency code
      return `${currency} ${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
  }
};

export const getCurrencySymbol = (currency: string): string => {
  switch (currency.toUpperCase()) {
    case 'IDR':
    case 'IDR.JK':
      return 'Rp';
    case 'USD':
    case 'USD.NASDAQ':
    case 'USD.NYSE':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'JPY':
      return '¥';
    case 'CNY':
      return '¥';
    case 'KRW':
      return '₩';
    case 'SGD':
      return 'S$';
    case 'MYR':
      return 'RM';
    case 'THB':
      return '฿';
    case 'PHP':
      return '₱';
    case 'VND':
      return '₫';
    default:
      return currency;
  }
};
