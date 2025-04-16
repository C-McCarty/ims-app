// type: 0 = success, 1 = info, 2 = error
export default function Banner({active, type, msg}) {
    if (active) {
        const icon = (type == 0 ? "success" : (type == 1 ? "info" : "error"));
        return (
            <div className="banner">
                <div className={`${icon} icon`}></div>
                <div>
                    <h4 className="msg">{msg}</h4>
                </div>
            </div>
        );
    }
}