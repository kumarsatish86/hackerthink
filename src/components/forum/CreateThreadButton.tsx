'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';

interface CreateThreadButtonProps {
  categoryId: number;
}

export default function CreateThreadButton({ categoryId }: CreateThreadButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        <FaPlus className="w-4 h-4" />
        <span>Sign in to post</span>
      </Link>
    );
  }

  return (
    <Link
      href={`/forum/create-thread?categoryId=${categoryId}`}
      className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
    >
      <FaPlus className="w-4 h-4" />
      <span>New Thread</span>
    </Link>
  );
}

