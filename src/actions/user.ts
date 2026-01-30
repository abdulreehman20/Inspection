// "use server"


// import db from "@/lib/db";
// import { User } from "@prisma/client";

// export async function createUser(data: User) {
//   try {
//     const user = await db.user.create({ data });
//     return { user };
//   } catch (error) {
//     return { error };
//   }
// }

// export async function getUserById(id?: string, clerkId?: string) {
//   try {
//     if (!id && !clerkId) {
//       throw new Error("id or clerkId is required");
//     }

//     const query = id ? { id } : { clerkId };
//     const user = await db.user.findUnique({ where: query });
//     return { user };
//   } catch (error) {
//     return { error };
//   }
// }

// export async function updateUser(id: string, data: Partial<User>) {
//   try {
//     const user = await db.user.update({
//       where: { id },
//       data,
//     });
//     return { user };
//   } catch (error) {
//     return { error };
//   }
// }
