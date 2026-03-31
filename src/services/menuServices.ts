import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { type MenuItem, type MenuItemFormData, CATEGORIES } from "../types/menu";
import { uploadMenuImage, deleteMenuImage } from "./imageServices";


const getCategoryLabel = (categoryId: string): string =>
  CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;

const ensureCategoryDocument = async (categoryId: string): Promise<void> => {
  const catRef  = doc(db, "menuItems", categoryId);
  const catSnap = await getDoc(catRef);
  if (!catSnap.exists()) {
    await setDoc(catRef, {
      label:     getCategoryLabel(categoryId),
      createdAt: serverTimestamp(),
    });
  }
};


const buildPayload = (formData: MenuItemFormData) => ({
  name:        formData.name.trim(),
  description: formData.description.trim(),
  price:       parseFloat(formData.price),
  available:   formData.available,
});


export const addMenuItem = async (formData: MenuItemFormData): Promise<void> => {
  await ensureCategoryDocument(formData.categoryId);

 
  const docRef = await addDoc(
    collection(db, "menuItems", formData.categoryId, "items"),
    { ...buildPayload(formData), createdAt: serverTimestamp() }
  );

 
  if (formData.imageFile) {
    const imageUrl = await uploadMenuImage(
      formData.imageFile,
      formData.categoryId,
      docRef.id        
    );
    await updateDoc(docRef, { imageUrl });
  }
};


export const updateMenuItem = async (
  existingItem: MenuItem,
  formData: MenuItemFormData
): Promise<void> => {
  const payload = buildPayload(formData);
  const categoryChanged = existingItem.categoryId !== formData.categoryId;

  if (!categoryChanged) {
   
    const update: Record<string, unknown> = { ...payload };

    if (formData.imageFile) {
     
      const imageUrl = await uploadMenuImage(
        formData.imageFile,
        existingItem.categoryId,
        existingItem.id
      );
      update.imageUrl = imageUrl;
    }

    await updateDoc(
      doc(db, "menuItems", existingItem.categoryId, "items", existingItem.id),
      update
    );

  } else {
    
    await deleteDoc(
      doc(db, "menuItems", existingItem.categoryId, "items", existingItem.id)
    );
    
    await deleteMenuImage(existingItem.categoryId, existingItem.id);

    
    await ensureCategoryDocument(formData.categoryId);

   
    const newDocRef = await addDoc(
      collection(db, "menuItems", formData.categoryId, "items"),
      { ...payload, createdAt: serverTimestamp() }
    );

    
    const imageFile = formData.imageFile ?? null;
   
    if (imageFile) {
      const imageUrl = await uploadMenuImage(
        imageFile,
        formData.categoryId,
        newDocRef.id
      );
      await updateDoc(newDocRef, { imageUrl });
    } else if (existingItem.imageUrl) {
      await updateDoc(newDocRef, { imageUrl: existingItem.imageUrl });
    }
  }
};


export const deleteMenuItem = async (item: MenuItem): Promise<void> => {
  
  await Promise.all([
    deleteDoc(doc(db, "menuItems", item.categoryId, "items", item.id)),
    deleteMenuImage(item.categoryId, item.id),
  ]);
};

export const toggleMenuItemAvailability = async (item: MenuItem): Promise<void> => {
  await updateDoc(
    doc(db, "menuItems", item.categoryId, "items", item.id),
    { available: !item.available }
  );
};