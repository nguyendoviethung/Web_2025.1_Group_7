import Plus from '../assets/Plus.svg'
import '../style/ActionButton.scss'
export default function ActionButton ({icon , className , text }){
    return(
        <div className = "wrapper">
            <img src= {Plus} alt="plus" className  />
            <div> Add New </div>
        </div>
    )
}