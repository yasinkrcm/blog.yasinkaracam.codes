export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const generateUniqueSlug = async (
  Model: any,
  title: string,
  locale: string
): Promise<string> => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists
  while (await Model.findOne({ slug, locale })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
