export function generateSlug(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    for (let i = 0; i < length; i++) {
      slug += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return slug;
  }