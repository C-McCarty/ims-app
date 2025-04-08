import { useEffect, useState } from "react";
import s from "../styles/loadingStyles.module.css";

export default function Loading() {
    const [loadingText, setLoadingText] = useState("Loading");
    useEffect(() => {
        const loadingAnimation = setInterval(() => {
            setLoadingText((prevText) => {
                if (prevText.length < 10) {
                    return prevText + ".";
                } else {
                    return "Loading";
                }
            });
        }, 500);

        return () => clearInterval(loadingAnimation);
    }, []);

    return (
        <div className={s.loadingWrapper}>
            <div className={s.loadingSpinner}></div>
            <h2 className={s.loadingText}>{loadingText}</h2>
        </div>
    );
}