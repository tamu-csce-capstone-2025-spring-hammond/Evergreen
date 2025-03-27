const PieChart = () => {
    return (
        <div className="flex-1">
            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 100 100">
                <defs>
                    <filter id="Filter1" x="0" y="0" width="1" height="1" primitiveUnits="objectBoundingBox">
                        <feTurbulence baseFrequency="0.1" numOctaves="2" result="turbulence"/>
                        <feComposite in="SourceGraphic" in2="turbulence" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
                    </filter>
                    <radialGradient id="Gradient1" cx="20" cy="20" r="75" transform-origin="50 50" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#6Ca091"/>
                        <stop offset="0.25" stop-color="#305067"/>
                        <stop offset="0.65" stop-color="#13131C"/>
                        <stop offset="1" stop-color="black"/>
                        <animateTransform attributeName="gradientTransform" type="translate" values="0;60 0;60 60;0 60;0" dur="8s" repeatCount="indefinite" />
                    </radialGradient>
                </defs>
	            <g>
	                <rect fill="url(#Gradient1)" width="100%" height="100%" opacity="0.85" rx="10"/>
                    <rect width="100%" height="100%" filter="url(#Filter1)" rx="10"/>
	            </g>
            </svg>
        </div>
    );
};

export default PieChart;
