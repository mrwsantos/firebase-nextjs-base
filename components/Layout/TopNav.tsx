import React from 'react'
// import { Breadcrumbs } from '../ui/breadcrumb'
import { useAuth } from '@/context/auth';

interface TopNavProps {
    title: string;
    // breadcrumbLabel?: string
}

const TopNav = ({ title,
    //  breadcrumbLabel 
    }: TopNavProps) => {
    const { appLoading } = useAuth()

    return (
        <nav className="sticky top-0 left-0 z-10 
        flex items-center justify-between gap-4
         w-full bg-muted
        ">
            {!appLoading && (
                <div className="flex flex-col gap-2">
                    {/* {breadcrumbLabel && (
                        <Breadcrumbs
                            items={[
                                {
                                    label: breadcrumbLabel,
                                },
                            ]}
                        />
                    )} */}
                    <h1 className="text-3xl font-bold text-dark-grey my-4">{title}</h1>
                </div>
            )}
            {/* <h2 className="text-2xl font-bold">Admin Dashboard</h2> */}
            {/* <div className=" flex items-center gap-4 justify-end">
                <Input
                    placeholder="Search..."
                    className="bg-white w-[300px] h-[40px] hover:shadow-lg"
                />
                <ul className="flex items-center gap-4">
                    <li>
                        <Button variant="outline" className="h-11 w-11 bg-primary text-white relative">
                            <Bell size={24} />
                            <span className='flex items-center justify-center absolute -top-1 -right-1 text-white bg-destructive w-4 h-4 rounded-md text-[10px] pl-0.5'>8</span>
                        </Button>
                    </li>
                </ul>
            </div> */}
        </nav>
    )
}

export default TopNav