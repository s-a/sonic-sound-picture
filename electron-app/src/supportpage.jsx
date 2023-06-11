import React from 'react'
import QR from './qr.jsx'
import {
	FacebookShareCount,
	RedditShareCount,
	TumblrShareCount,
	HatenaShareCount,
	FacebookShareButton,
	FacebookMessengerShareButton,
	FacebookMessengerIcon,
	LinkedinShareButton,
	TwitterShareButton,
	TelegramShareButton,
	WhatsappShareButton,
	RedditShareButton,
	EmailShareButton,
	TumblrShareButton,
	LivejournalShareButton,
	MailruShareButton,
	ViberShareButton,
	WorkplaceShareButton,
	LineShareButton,
	PocketShareButton,
	InstapaperShareButton,
	HatenaShareButton,
	FacebookIcon,
	TwitterIcon,
	LinkedinIcon,
	TelegramIcon,
	WhatsappIcon,
	RedditIcon,
	TumblrIcon,
	MailruIcon,
	EmailIcon,
	LivejournalIcon,
	ViberIcon,
	WorkplaceIcon,
	LineIcon,
	PocketIcon,
	InstapaperIcon,
	HatenaIcon,
} from 'react-share'

class SupportPage extends React.Component {

	render() {
		const shareUrl = 'https://github.com/s-a/sonic-sound-picture';
		const title = 'Audio Visualizer - Sonic Sound Picture';

		return (<div>

			<h3>Why this page?</h3>
			<p>
				In the recent years several tools, libs and plugins have been developed.
				We hope you will find these tools helpful for your work.
				They are all free for commercial and non-commercial projects and available without any restrictions at all.
				However, if you really work with one of them often, please think about donating (options below) or other support options.
			</p>
			<p className='d'>
				For discussions and questions you can contact us at our <a onClick={myAPI.open.bind(this.props.app, 'https://discord.gg/MaKtp6jx3T')} href="#">Discord Server</a> or the regarding issue section at GitHub. Our official collection of repositories can be found there.
			</p>
			<h3 className='u'>Support Options</h3>
			<hr />
			<div className='i'>
				<h4>Push The Algoriddims 🤗</h4>
				<hr />
				<ul>
					<li>
						<a href="https://github.com/s-a/sonic-sound-picture" target='_BLANK'>Give the project a star</a>
					</li>
					<li>
						<a href="https://www.youtube.com/channel/UCHU9JqmPFrC0js3mWWbN_yA" target='_BLANK'>Follow this guy on Youtube (he helped A LOT to make this tool real!)</a>
					</li>
				</ul>
			</div>
			<div className='i'>
				<h4>Spread the word 🤗</h4>
				<hr />
				<div className="row">
					<div className="col">
						<FacebookShareButton
							url={shareUrl}
							quote={title}
							className="col__share-button"
						>
							<FacebookIcon size={32} round />
						</FacebookShareButton>

						<div>
							<FacebookShareCount url={shareUrl} className="col__share-count">
								{count => count}
							</FacebookShareCount>
						</div>
					</div>

					<div className="col">
						<FacebookMessengerShareButton
							url={shareUrl}
							appId="521270401588372"
							className="col__share-button"
						>
							<FacebookMessengerIcon size={32} round />
						</FacebookMessengerShareButton>
					</div>

					<div className="col">
						<TwitterShareButton
							url={shareUrl}
							title={title}
							className="col__share-button"
						>
							<TwitterIcon size={32} round />
						</TwitterShareButton>

						<div className="col__share-count">&nbsp;</div>
					</div>

					<div className="col">
						<TelegramShareButton
							url={shareUrl}
							title={title}
							className="col__share-button"
						>
							<TelegramIcon size={32} round />
						</TelegramShareButton>

						<div className="col__share-count">&nbsp;</div>
					</div>

					<div className="col">
						<WhatsappShareButton
							url={shareUrl}
							title={title}
							separator=":: "
							className="col__share-button"
						>
							<WhatsappIcon size={32} round />
						</WhatsappShareButton>

						<div className="col__share-count">&nbsp;</div>
					</div>

					<div className="col">
						<LinkedinShareButton url={shareUrl} className="col__share-button">
							<LinkedinIcon size={32} round />
						</LinkedinShareButton>
					</div>


					<div className="col">
						<RedditShareButton
							url={shareUrl}
							title={title}
							windowWidth={660}
							windowHeight={460}
							className="col__share-button"
						>
							<RedditIcon size={32} round />
						</RedditShareButton>

						<div>
							<RedditShareCount url={shareUrl} className="col__share-count" />
						</div>
					</div>

					<div className="col">
						<TumblrShareButton
							url={shareUrl}
							title={title}
							className="col__share-button"
						>
							<TumblrIcon size={32} round />
						</TumblrShareButton>

						<div>
							<TumblrShareCount url={shareUrl} className="col__share-count" />
						</div>
					</div>

					<div className="col">
						<LivejournalShareButton
							url={shareUrl}
							title={title}
							description={shareUrl}
							className="col__share-button"
						>
							<LivejournalIcon size={32} round />
						</LivejournalShareButton>
					</div>

					<div className="col">
						<MailruShareButton
							url={shareUrl}
							title={title}
							className="col__share-button"
						>
							<MailruIcon size={32} round />
						</MailruShareButton>
					</div>

					<div className="col">
						<EmailShareButton
							url={shareUrl}
							subject={title}
							body="body"
							className="col__share-button"
						>
							<EmailIcon size={32} round />
						</EmailShareButton>
					</div>
					<div className="col">
						<ViberShareButton
							url={shareUrl}
							title={title}
							className="col__share-button"
						>
							<ViberIcon size={32} round />
						</ViberShareButton>
					</div>

					<div className="col">
						<WorkplaceShareButton
							url={shareUrl}
							quote={title}
							className="col__share-button"
						>
							<WorkplaceIcon size={32} round />
						</WorkplaceShareButton>
					</div>

					<div className="col">
						<LineShareButton
							url={shareUrl}
							title={title}
							className="col__share-button"
						>
							<LineIcon size={32} round />
						</LineShareButton>
					</div>


					<div className="col">
						<PocketShareButton
							url={shareUrl}
							title={title}
							className="col__share-button"
						>
							<PocketIcon size={32} round />
						</PocketShareButton>
					</div>

					<div className="col">
						<InstapaperShareButton
							url={shareUrl}
							title={title}
							className="col__share-button"
						>
							<InstapaperIcon size={32} round />
						</InstapaperShareButton>
					</div>

					<div className="col">
						<HatenaShareButton
							url={shareUrl}
							title={title}
							windowWidth={660}
							windowHeight={460}
							className="col__share-button"
						>
							<HatenaIcon size={32} round />
						</HatenaShareButton>

						<div>
							<HatenaShareCount url={shareUrl} className="col__share-count" />
						</div>
					</div>
				</div>
			</div>
			<div className='i'>
				<h4>Donation 😎</h4>
				<div>
					<span>Support the development of the software and the poor dev created it with ❤️</span>
					<p className='u'>
						<QR style={{}} className="d-flex" width={128} height={128} />
						<small>Doge: DADGqb3M8bCLawVk7Y7Exc92ZVG19YwQru</small>
					</p>
				</div>
			</div>
		</div >)
	}
}

export default SupportPage