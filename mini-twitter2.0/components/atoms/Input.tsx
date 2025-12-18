import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

export const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      className="
        w-full           
        p-3               
        border           
        border-gray-700   
        rounded-lg       
        bg-black          
        text-white        
        focus:outline-none  
        focus:border-blue-500 
        transition-all    
      "
      {...props}
    />
  );
};