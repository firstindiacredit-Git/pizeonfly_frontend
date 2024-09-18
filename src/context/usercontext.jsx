import {createContext, useContext, useState} from 'react';


const UserContext = createContext();

const UserProvider = ({children})=>{

    const [user, setUser] = useState(null); // Store user data here
    return <UserContext.Provider value={{user:setUser}}>
            {children}
            </UserContext.Provider>
}

// custom hook 
const useUserContext = ()=>{
    return  useContext(UserContext)
}

export {UserProvider,UserContext,useUserContext}