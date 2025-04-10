interface Trendline {
    home: boolean;
    color: string;
    data: Array<number>;
}

const Trendline: React.FC<Trendline> = ({home, color, data}) => {

    const strokeColor = color === "text-evergreen-500" ? "stroke-evergreen-500" : color === "text-everred-500" ? "stroke-everred-500" : "stroke-evergray-500";

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);

    const realWidth = (home) ? 290 : 410;
    const width = realWidth - 10;
    const height = 100;

    let path = [];
    
    for(let i = 0; i < data.length; i++) {
        let x = (i / (data.length - 1)) * width;
        let y = (maxValue === minValue) ? height/2 : height - ((data[i] - minValue) / (maxValue - minValue) * height);

        if(i === 0) path.push(`M ${x} ${y}`);
        else path.push(`L ${x} ${y}`);
    }

    if(path.length === 0) path = [`M 0 ${height/2} L ${width} ${height/2}`]

    return (
        <div className="flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox={`-5 -5 ${realWidth} 110`} className={`fill-transparent ${strokeColor}`}>
                <path d={`${path.join('')}`} strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>
    );
};

export default Trendline;