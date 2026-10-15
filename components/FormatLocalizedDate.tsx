// لتاريخ الميلاد والوفاة (تاريخ مفصل)
export const formatLocalizedDate = (
  dateString: string,
  locale: "ar" | "tr" | "en"
) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const year = date.getFullYear();

  const months = {
    ar: [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ],
    tr: [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ],
    en: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  };

  const monthName = months[locale][date.getMonth()];
  return `${day} ${monthName} ${year}`;
};

export const formatYearOnly = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}`;
};
