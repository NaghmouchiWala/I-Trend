const users = [
    {
      name: "Fnac Tunisie",
      email: "test@fnac.tn",
      password: "password",
      image: '/images/fnac.png',
    },
]
  
export type User = (typeof users)[number]
  
export const getUserByEmail = (email: string) => {
    return users.find((user) => user.email === email)
}