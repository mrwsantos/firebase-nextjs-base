import React from 'react'
import { useMenu } from '@/hooks/useMenu';
interface MainWrapperProps {
    children: React.ReactNode
}

const MainWrapper = ({ children }: MainWrapperProps) => {
    const { shrinkMenu } = useMenu();

    return (
        <div className={`flex flex-col flex-1 h-full p-10 bg-cover gap-5 ${shrinkMenu ? 'ml-20' : 'ml-80'} transition-all duration-500`}>
            {children}
        </div>
    )
}

export default MainWrapper