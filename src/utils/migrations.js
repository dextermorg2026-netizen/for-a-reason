import { collectionGroup, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * Migrates all 'participants' documents in collection group to ensure 
 * they have a 'userId' field. This enables the optimized history query.
 * 
 * New participant records already save this field, so this script 
 * primarily targets legacy records.
 */
export const migrateParticipantUserId = async () => {
  try {
    console.log("[Migration] Scanning for legacy participant records...");
    
    // We fetch all participant documents globally.
    // Note: This is a heavy operation, but only needs to be run once.
    const snapshot = await getDocs(collectionGroup(db, "participants"));
    let updatedCount = 0;
    let skippedCount = 0;

    const migrationPromises = snapshot.docs.map(async (pDoc) => {
      const data = pDoc.data();
      
      // If userId field is missing, we use the document ID (which is the uid)
      if (!data.userId) {
        try {
          await updateDoc(pDoc.ref, { userId: pDoc.id });
          updatedCount++;
        } catch (err) {
          console.error(`[Migration] Failed to update doc ${pDoc.id}:`, err.message);
        }
      } else {
        skippedCount++;
      }
    });

    await Promise.all(migrationPromises);

    console.log(`[Migration] Process Complete!`);
    console.log(`[Migration] Updated: ${updatedCount} documents`);
    console.log(`[Migration] Skipped: ${skippedCount} items (already updated)`);
    
    return { updatedCount, skippedCount };
  } catch (err) {
    console.error("[Migration] Critical error during migration:", err);
    throw err;
  }
};
