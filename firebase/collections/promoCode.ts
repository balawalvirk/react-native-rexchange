import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { PromoCode } from '../../lib/models/promoCode';

export const validatePromoCode = async (promoCode: string) => {
  try {
    const querySnapshot = await getDocs(collection(getFirestore(), 'promoCode'));
    const dbCode =
      (querySnapshot.docs[0].data() as PromoCode) || ({} as PromoCode);
    if (dbCode.code === promoCode) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error validating promo code:', error);
    return false;
  }
};
