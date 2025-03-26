import Trendline from "./trendline";
import { time_left } from "@/utils";

interface PortfolioCard {
    name: string;
    color: string;
    total: number;
    percent: number;
    // dataPoints: Array<T>;
    home: boolean;
    startDate: string;
    endDate: string;
    deposited: number;
}

const PortfolioCard: React.FC<PortfolioCard> = ({ name, color, total, percent, home, startDate, endDate, deposited }) => {
    

    const parsePercent = String(percent)[0] === "-" ? String(percent).slice(1) : percent;
    const difference = (total * Number(parsePercent) / 100).toFixed(2);

    const feedbackColor = (percent > 0) ? "text-evergreen-500" : (percent < 0) ? "text-everred-500" : "text-evergray-500";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const totalDuration = end.getTime() - start.getTime();
    const elapsedTime = today.getTime() - start.getTime();
    const completionPercent = Math.min((elapsedTime / totalDuration) * 100, 100).toFixed(2);

    const timeLeft = time_left(startDate, endDate);
    
    startDate += "/" + startDate.slice(0, 4);
    startDate = startDate.slice(5).replaceAll("-", "/");
    endDate += "/" + endDate.slice(0, 4);
    endDate = endDate.slice(5).replaceAll("-", "/");

    let gained = (deposited - total).toFixed(2);
    if(String(gained)[0] === "-") gained = gained.slice(1);

    if(home) {
        return (
        <div className="p-4 flex justify-between items-center border-1 border-evergray-300 rounded-3xl relative overflow-hidden gap-6 cursor-pointer">
            <div style={{ backgroundColor: color }} className="w-1/30 h-full absolute left-0 top-0"></div>
            <div className="flex whitespace-nowrap justify-between w-40/100">
                <div className="ml-6 ">
                    <h3 className="text-2xl pb-1 text-evergray-700">{name}</h3>
                    <p className="text-xl font-roboto text-evergray-500">${total}</p>
                </div>
                <div className={`font-roboto text-end ${feedbackColor}`}>
                    <p className="text-2xl relative -top-1"><span className="text-3xl pr-2">{(percent > 0) ? "▲" : (percent < 0) ? "▼" : "-"}</span>{parsePercent}%</p>
                    <p className="text-xl">{difference}</p>
                </div>
            </div>
            <Trendline home={home} />
            <div className="mr-4 whitespace-nowrap text-md text-evergray-600 [&_span]:tracking-wider [&_span]:pl-1 w-24/100">
                <p>Start: <span className="font-roboto">{startDate}</span></p>
                <p>End: <span className="font-roboto">{endDate}</span></p>
                <p>Time Left: <span className="font-roboto">{timeLeft}</span></p>
            </div>

        </div>
        );
    }

    return (
        <div className="p-4 flex justify-between items-center border-1 border-evergray-300 rounded-3xl relative overflow-hidden gap-6 cursor-pointer">
            <div style={{ backgroundColor: color }} className="w-1/30 h-full absolute left-0 top-0"></div>
            <div className={`flex whitespace-nowrap justify-between w-1/2`}>
                <div className="ml-6 ">
                    <h3 className="text-[1.65rem] text-evergray-700">{name}</h3>
                    <p className="text-[1.45rem] font-roboto text-evergray-500 mb-3">${total}</p>
                    <p className="text-md text-evergray-500">Desposited:<span className="pl-2 font-roboto">${deposited}</span></p>
                    <p className="text-md text-evergray-500">Gained:<span className="pl-2 font-roboto">${gained}</span></p>
                </div>
                <div className={`font-roboto text-end ${feedbackColor}`}>
                    <p className="text-3xl relative"><span className="text-3xl pr-3">▲</span>{parsePercent}%</p>
                    <p className="text-2xl relative top-1 mb-[18px]">{difference}</p>
                    <div className="whitespace-nowrap text-md text-evergray-500 [&_span]:tracking-wider text-start">
                        <p className="font-raleway">Start: <span className="font-roboto">{startDate}</span></p>
                        <p className="font-raleway">End: <span className="pl-[0.35rem] font-roboto">{endDate}</span></p>
                    </div>    
                </div>
            </div>
            <div className="mr-4 whitespace-nowrap text-md text-evergray-600 w-1/2 relative">
                <Trendline home={home} />
                <div className="relative w-full h-[0.35rem] bg-evergray-300 my-1">
                    <div 
                        className="h-full" 
                        style={{ width: `${completionPercent}%`, backgroundColor: color }}
                    />
                </div>
                <p className="flex-1 text-md">Time Left: <span className="font-roboto">{timeLeft}</span></p>
            </div>
        </div>
    );
  };
  
  export default PortfolioCard;
  