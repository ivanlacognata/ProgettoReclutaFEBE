import React from 'react';

interface PostHeaderProps {
  username: string;
  time: string;
}

export default function PostHeader({ username, time }: PostHeaderProps) {
  return (
    <div>
      <p className="text-m">@{username}</p>
      <p className = "text-sm">{time}</p>
    </div>
  );
}
