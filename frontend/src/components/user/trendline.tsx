interface Trendline {
    home: boolean;
}

const Trendline: React.FC<Trendline> = ({home}) => {
    return (
        <div className="flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${home ? 300 : 420} 110`}>
                <defs>
                    <filter id="Diffuse" primitiveUnits="objectBoundingBox">
                        <feDiffuseLighting in="SourceGraphic" result="light">
                            <fePointLight x=".25" y=".25" z=".15" />
                        </feDiffuseLighting>
                        <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
                    </filter>
                </defs>
                <rect width="100%" height="100%" fill="gainsboro"/>
                <circle id="circle" cx="150" cy="50" r="25" fill="blue" filter="url(#Diffuse)"/>
            </svg>
        </div>
    );
};

export default Trendline;