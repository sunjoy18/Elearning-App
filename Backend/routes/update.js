const express = require("express");
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/CM')
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const host = process.env.HOST;

// Completed
router.post("/update/chapter", upload.array("video", 5), async (req, res) => {
	try {
		const courseName = req.body.courseName.trimEnd();
		const moduleName = req.body.moduleName.trimEnd();
		const chapterName = req.body.chapterName.trimEnd();
		const unitName = req.body.unitName.trimEnd();
		const minAnswer = req.body.min.trimEnd();
		const origin = req.body.org;

		const question = req.body.questions;
		const option = req.body.option;
		const correctAnswer = req.body.correctAnswer;

		const existingChapter = await Course.findOne({
			name: courseName,
			"modules": {
				$elemMatch: {
					name: moduleName,
					"units": {
						$elemMatch: {
							name: unitName,
							chapters: {
								$elemMatch: {
									name: chapterName,
								},
							},
						},
					},
				},
			},
		});	

		if (existingChapter) {
			console.log("Chapters: ", existingChapter);
			console.log("Chapter name already exists. Cannot update.");
			return res.status(400).json({ message: "Chapter name already in use. Cannot update." });
		}

		Course.findOne({ name: courseName })
			.then((course) => {
				if (!course) {
					console.log("Course not found.");
					return null;
				}

				// Step 2: Update the Chapter
				return Course.findOneAndUpdate(
					{
						name: courseName,
						"modules.name": moduleName,
						"modules.units.name": unitName,
					},
					{
						$push: {
							"modules.$[mod].units.$[uni].chapters": { name: chapterName, minAnswer: minAnswer },
						},
						$setOnInsert: {
							__v: 0,
						},
					},
					{
						arrayFilters: [
							{ "mod.name": moduleName },
							{ "uni.name": unitName },
						],
						upsert: true,
						new: true,
					}
				);
			})
			.then(async (updatedCourse) => {
				if (updatedCourse) {
					// console.log('chapter added:', updatedCourse);

					if (origin == "backend") {
						res.json({ message: 'done' })
					}

					if (req.files) {
						const form = new FormData();
						// console.log(req.files);
						form.append("courseName", courseName);
						form.append("moduleName", moduleName);
						form.append("chapterName", chapterName);
						form.append("unitName", unitName);
						form.append("min", minAnswer);
						form.append("org", "backend");

						question.forEach((q, index) => {
							form.append(`questions[${index}]`, q);
						});

						option.forEach((o, index) => {
							form.append(`option[${index}]`, o);
						});

						correctAnswer.forEach((ca, index) => {
							form.append(`correctAnswer[${index}]`, ca);
						});

						req.files.forEach((file) => {
							form.append(`files`, Buffer.from(file.buffer), {
								filename: file.originalname,
							});
						});
						// console.log(form);

						// Make a POST request to the other API
						const content = await axios.post(
							`http://${host}:5000/api/upload/content`,
							form,
							{
								headers: {
									...form.getHeaders(),
								},
							}
						);
						if (content) {
							let videos = [];
							for (let index = 0; index < req.body.videoName.length; index++) {
								
								videos.push({ name: req.body.videoName[index], url: req.body.url[index] });
							}
							console.log(videos);

							const requestData = {
								courseName: courseName,
								moduleName: moduleName,
								unitName: unitName,
								chapterName: chapterName,
								videos: videos,
							};

							let headers = {
								'Content-Type': 'application/json',
							};

							
							const video = await axios.post(`http://${host}:5000/api/update/videos`, requestData,
							{
								headers
							})
							if (video) {
								
								await User.updateMany(
									{ 'courseStatus.courseName': courseName },
									{
										$push: {
											'courseStatus.$[status].modules.$[mod].units.$[uni].chapters': { chapterName: chapterName, completed: false }
										}
									},
									{
										arrayFilters: [
											{ 'status.courseName': courseName },
											{ 'mod.moduleName': moduleName },
											{ 'uni.unitName': unitName },
										],
										upsert: true,
										new: true,
									}
								);
							}
							res.status(200).json({ message: "chapter updated successfully" });
						}
					}
					else {
						res.status(200).json({ message: "chapter name updated successfully" });

					}
				}
			})
			.catch((err) => {
				console.error("Errors:");
				res.status(500).json({ message: "chapter not updated" });
			});
	} catch (error) {
		console.error("Error chapter added:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Completed
router.post("/update/unit", upload.array("video", 5), async (req, res) => {
	try {
		const courseName = req.body.courseName.trimEnd();
		const moduleName = req.body.moduleName.trimEnd();
		const unitName = req.body.unitName.trimEnd();
		const chapterName = req.body.chapterName.trimEnd();
		const min = req.body.min.trimEnd();
		const origin = req.body.org.trimEnd();
		const question = req.body.questions;
		const option = req.body.option;
		const correctAnswer = req.body.correctAnswer;



		const existingUnit = await Course.findOne({
			name: courseName,
			"modules.name": moduleName,
			"modules.units": {
				$elemMatch: {
					name: moduleName,
					"units.name": unitName,
				},
			},
		});

		if (existingUnit) {
			console.log("Unit name already exists. Cannot update.");
			return res
				.status(400)
				.json({ message: "Unit name already in use. Cannot update." });
		}

		Course.findOne({ name: courseName })
			.then(async (course) => {
				if (!course) {
					console.log("Course not found.");
					return null;
				}

				// Step 2: Update the Chapter
				return Course.findOneAndUpdate(
					{
						name: courseName,
						"modules.name": moduleName,
					},
					{
						$push: {
							"modules.$[mod].units": { name: unitName },
						},
						$setOnInsert: {
							__v: 0,
						},
					},
					{
						arrayFilters: [{ "mod.name": moduleName }],
						upsert: true,
						new: true,
					}
				);
			})
			.then(async (updatedCourse) => {
				if (updatedCourse) {
					console.log("Unit Added");



					if (origin == "backend") {
						return res.json({ message: 'done' })
					}

					const chapter = await axios.post(
						`http://${host}:5000/api/update/chapter`,
						{
							courseName: courseName,
							moduleName: moduleName,
							unitName: unitName,
							chapterName: chapterName,
							min: min,
						}
					);
					if (chapter) {
						const form = new FormData();

						form.append("courseName", courseName);
						form.append("moduleName", moduleName);
						form.append("chapterName", chapterName);
						form.append("unitName", unitName);
						form.append("min", min);
						form.append("org", "backend");
						question.forEach((q, index) => {
							form.append(`questions[${index}]`, q);
						});

						option.forEach((o, index) => {
							form.append(`option[${index}]`, o);
						});

						correctAnswer.forEach((ca, index) => {
							form.append(`correctAnswer[${index}]`, ca);
						});

						req.files.forEach((file) => {
							form.append(`files`, Buffer.from(file.buffer), {
								filename: file.originalname,
							});
						});

						// Make a POST request to the other API
						const content = await axios.post(
							`http://${host}:5000/api/upload/content`,
							form,
							{
								headers: {
									...form.getHeaders(),
								},
							}
						);
						if (content) {
							
							let videos = [];
							for (let index = 0; index < req.body.videoName.length; index++) {
								
								videos.push({ name: req.body.videoName[index], url: req.body.url[index] });
							}
							console.log(videos);

							const requestData = {
								courseName: courseName,
								moduleName: moduleName,
								unitName: unitName,
								chapterName: chapterName,
								videos: videos,
							};

							let headers = {
								'Content-Type': 'application/json',
							};

							
							const video = await axios.post(`http://${host}:5000/api/update/videos`, requestData,
							{
								headers
							})

							if (video) {
								
								await User.updateMany(
									{ 'courseStatus.courseName': courseName },
									{
										$push: {
											'courseStatus.$[status].modules.$[mod].units': { unitName: unitName, completed: false }
										}
									},
									{
										arrayFilters: [
											{ 'status.courseName': courseName },
											{ 'mod.moduleName': moduleName },
										],
										upsert: true,
										new: true,
									}
								);
							}
							res.status(200).json({ message: "Unit updated successfully" });
						}
					}
					// res.status(200).json({ message: 'unit updated successfully' });
				}
			})
			.catch((err) => {
				console.log('Unit error : ', err)
				res.status(500).json({ message: "unit not updated successfully" });
			});
	} catch (error) {
		// console.error("Error chapter added:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Completed
router.post("/update/videos", async (req, res) => {
	try {

		console.log(req.body);
		const courseName = req.body.courseName.trimEnd();
		const moduleName = req.body.moduleName.trimEnd();
		const chapterName = req.body.chapterName.trimEnd();
		const unitName = req.body.unitName.trimEnd();

		// const videos = JSON.parse(req.body.videos);


		const updatedCourse = await Course.findOneAndUpdate(
			{
				name: courseName,
				"modules.name": moduleName,
				"modules.units.name": unitName,
				"modules.units.chapters.name": chapterName,
			},
			{
				$push: {
					"modules.$[mod].units.$[uni].chapters.$[chap].contents.videos": {
						$each: req.body.videos,
					},
				},
			},
			{
				arrayFilters: [
					{ "mod.name": moduleName },
					{ "uni.name": unitName },
					{ "chap.name": chapterName },
				],
				new: true, // Return the modified document
			}
		);

		if (updatedCourse) {
			res.status(200).json({ message: "Videos added successfully", updatedCourse });
		} else {
			console.log(`Course with name '${courseName}' or specified hierarchy not found.`);
			res.status(404).json({ error: `Course with name '${courseName}' or specified hierarchy not found.` });
		}
	} catch (error) {
		console.error("Error adding videos:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Completed
router.post("/update/quiz", async (req, res) => {
	try {
		
		const courseName = req.body.courseName.trimEnd();
		const moduleName = req.body.moduleName.trimEnd();
		const unitName = req.body.unitName.trimEnd();
		const chapterName = req.body.chapterName.trimEnd();

		let Questions = [];
		for (let i = 0; i < req.body.questions.length; i++) {
			Questions.push({
				question: req.body.questions[i],
				options: req.body.option[i].split(","),
				correctAnswer: req.body.correctAnswer[i],
			})
			
		}
		console.log(Questions)

		// Step 1: Find the Course
		const course = await Course.findOne({ name: courseName });

		if (!course) {
			return res.status(404).json({ error: "Course not found" });
		}

		// Step 2: Find and update the Quiz
		const updatedCourse = await Course.findOneAndUpdate(
			{
				name: courseName,
				"modules.name": moduleName,
				"modules.units.name": unitName,
				"modules.units.chapters.name": chapterName,
			},
			{
				$push: {
					"modules.$[mod].units.$[uni].chapters.$[chap].contents.quiz.questions": { $each: Questions },
				},
			},
			{
				arrayFilters: [
					{ "mod.name": moduleName },
					{ "uni.name": unitName },
					{ "chap.name": chapterName },
				],
				new: true,
			}
		);

		if (!updatedCourse) {
			return res.status(404).json({ error: "Chapter not found" });
		}

		res.status(200).json({ message: "Quiz updated successfully" });
	} catch (error) {
		console.error("Error updating quiz:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});


router.post("/update/module", upload.array("video", 5), async (req, res) => {
	try {
		const courseName = req.body.courseName.trimEnd();
		const moduleName = req.body.moduleName.trimEnd();
		const unitName = req.body.unitName.trimEnd();
		const chapterName = req.body.chapterName.trimEnd();
		const min = req.body.min.trimEnd();
		const question = req.body.questions;
		const option = req.body.option;
		const correctAnswer = req.body.correctAnswer;

		const existingModule = await Course.findOne({
			name: courseName,
			"modules.name": moduleName,
		});

		if (existingModule) {
			console.log("Module name already exists. Cannot update.");
			return res.status(400).json({ message: "Module name already in use. Cannot update." });
		}

		Course.findOne({ name: courseName })
			.then((course) => {
				if (!course) {
					console.log("Course not found.");
					return null;
				}

				// Step 2: Update the Chapter
				return Course.findOneAndUpdate(
					{
						name: courseName,
					},
					{
						$push: {
							modules: { name: moduleName },

						},
						$setOnInsert: {
							__v: 0,
						},
					},
					{
						upsert: true,
						new: true,
					}
				);
			})
			.then(async (updatedCourse) => {
				if (updatedCourse) {
					console.log("module added:");

					const unit = await axios.post(
						`http://${host}:5000/api/update/unit`,
						{
							courseName: courseName,
							moduleName: moduleName,
							unitName: unitName,
							chapterName: chapterName,
							min: min,
							org: "backend"
						}
					);
					if (unit) {
						const chapter = await axios.post(
							`http://${host}:5000/api/update/chapter`,
							{
								courseName: courseName,
								moduleName: moduleName,
								unitName: unitName,
								chapterName: chapterName,
								min: min,
							}
						);
						if (chapter) {
							const form = new FormData();

							form.append("courseName", courseName);
							form.append("moduleName", moduleName);
							form.append("chapterName", chapterName);
							form.append("unitName", unitName);
							form.append("min", min);

							question.forEach((q, index) => {
								form.append(`questions[${index}]`, q);
							});

							option.forEach((o, index) => {
								form.append(`option[${index}]`, o);
							});

							correctAnswer.forEach((ca, index) => {
								form.append(`correctAnswer[${index}]`, ca);
							});

							req.files.forEach((file) => {
								form.append(`files`, Buffer.from(file.buffer), {
									filename: file.originalname,
								});
							});

							// Make a POST request to the other API
							const content = await axios.post(
								`http://${host}:5000/api/upload/content`,
								form,
								{
									headers: {
										...form.getHeaders(),
									},
								}
							);
							if (content) {

								let videos = [];
								for (let index = 0; index < req.body.videoName.length; index++) {

									videos.push({ name: req.body.videoName[index], url: req.body.url[index] });
								}
								console.log(videos);

								const requestData = {
									courseName: courseName,
									moduleName: moduleName,
									unitName: unitName,
									chapterName: chapterName,
									videos: videos,
								};

								let headers = {
									'Content-Type': 'application/json',
								};


								const video = await axios.post(`http://${host}:5000/api/update/videos`, requestData,
									{
										headers
									})

								if (video) {

									await User.updateMany(
										{ 'courseStatus.courseName': courseName },
										{
											$push: {
												'courseStatus.$[status].modules': { moduleName: moduleName, completed: false }
											}
										},
										{
											arrayFilters: [
												{ 'status.courseName': courseName },
											],
											upsert: true,
											new: true,
										}
									);
								}

							}
						}
					}
					res.status(200).json({ message: "module updated successfully" });
				}
			})
			.catch((err) => {
				console.error("Error module:", err);
				res.status(500).json({ message: "Module not updated successfully" });
			});
	} catch (error) {
		console.error("Error chapter added:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;