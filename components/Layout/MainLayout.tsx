import React from 'react'
import SidebarNav from './SidebarNav'
import MainWrapper from './MainWrapper'
// import TopNav from './TopNav';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbLabel?: string
}

const MainLayout = ({ 
    // title='',
    children }: MainLayoutProps) => {
    return (
        <>
            <SidebarNav />
            <MainWrapper>
                {/* <TopNav title={title}  */}
                {/* // breadcrumbLabel={breadcrumbLabel}  */}
                {/* /> */}
                <div className="content-wrapper flex-1 p-0 ">
                    {children}
                </div>
            </MainWrapper>
        </>
    )
}

export default MainLayout