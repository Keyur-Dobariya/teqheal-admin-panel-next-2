import imagePaths from "../utils/imagesPath";

export const LoadingComponent = () => {
    return (
        <div className="loader flex items-center justify-center">
            <img src={imagePaths.icon_sm_dark} alt="logo" width={35} height={35}/>
        </div>
    )
}