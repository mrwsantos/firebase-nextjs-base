'use client';

import React, { Suspense } from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '@/components/ui/loading';

// Componente que usa useSearchParams
const NotFoundContent = () => {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const router = useRouter();

    return (
        <>
            <Logo className='bg-muted p-4 rounded-md' />
            <div className='flex flex-col items-center gap-10'>
                <h1 className='text-4xl'>You shall not pass!</h1>
                <Button className='bg-muted h-15 text-dark-grey font-bold text-md border-1 hover:text-muted hover:border-muted' onClick={() => router.push(url || '/login')}>
                   {"Sorry, I'll go back safely."}
                </Button>
            </div>
       
        </>
    );
};

// Componente principal com Suspense
const NotFoundPage = () => {
    return (
        <div
            className='flex flex-col items-center justify-center gap-10 h-screen w-full overflow-hidden pt-20 text-muted bg-dark-grey'
            // style={{
            //     // backgroundImage: `url(/guardian-3.png)`,
            //     backgroundPosition: 'bottom',
            //     backgroundSize: 'cover'
            // }}
        >


            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <Logo />
                    <Loading />
                </div>
            }>
                <NotFoundContent />
            </Suspense>
        </div>
    );
};

export default NotFoundPage;