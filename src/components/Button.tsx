import clsx from "clsx";
import React from "react";

interface ButtonProps {
	children: React.ReactNode;
	className?: string;
	onClick: () => void;
	disabled?: boolean;
}

const Button = ({ className, onClick, children, disabled }: ButtonProps) => {
	return (
		<button
			className={clsx(
				"px-4 py-2",
				"bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
				"border-b-4 hover:border-b-2 hover:mt-0.5 active:mt-0.5 border-blue-800",
				"disabled:bg-gray-600 disabled:border-gray-800",
				"rounded-sm text-white",
				className
			)}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	);
};

export default Button;
